// The CI checks that can run on this machine, so a push doesn't have to wait
// for GitHub to find them: `npm run ci:local` (also run by the pre-push hook).
//
//   lockfile      npm ci accepts package-lock.json on Linux with the Node
//                 version in .nvmrc, as CI installs it. Windows npm accepts
//                 lockfiles that Linux npm rejects, so on Windows this runs in
//                 WSL (skipped with a warning when WSL is not set up).
//   advisories    no package in the lockfile has a high or critical advisory.
//                 Stricter than CI's dependency review, which only checks
//                 packages the pull request changes.
//   lint, typecheck, test   the same npm scripts CI runs.
//   codeql        with --codeql (`npm run ci:pr`, a few minutes): CodeQL with
//                 the settings in .github/workflows/codeql.yml, failing on
//                 what would block the pull request. Reviewed false positives
//                 are listed, with the reason, in .github/codeql/accepted-alerts.json
//                 (dismiss them in GitHub too). Runs on Linux (WSL on Windows);
//                 the first run downloads CodeQL to ~/.cache/codeql there.
//
// Not covered: the production build and smoke test, which need a database.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The CodeQL bundle GitHub's codeql-action used when this was set; raise it
// when CI reports a newer version (Analyze job, "Initialize CodeQL" step).
const CODEQL_VERSION = "2.27.3";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lockfile = join(root, "package-lock.json");
const acceptedAlertsFile = join(root, ".github", "codeql", "accepted-alerts.json");
const nodeVersion = readFileSync(join(root, ".nvmrc"), "utf8").trim();
const isWindows = process.platform === "win32";

function run(command, args, options = {}) {
  return spawnSync(command, args, { cwd: root, stdio: "inherit", ...options });
}

// On Windows npm is npm.cmd, which needs a shell and, from inside `npm run`,
// can resolve to a missing npm: run the npm installed next to node instead
// (where the Node installer and nvm-windows put it).
const windowsNpmCli = join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");

function npm(args, options = {}) {
  if (!isWindows) return run("npm", args, options);
  if (!existsSync(windowsNpmCli)) {
    console.error(`npm not found at ${windowsNpmCli}`);
    return { status: 1 };
  }
  return run(process.execPath, [windowsNpmCli, ...args], options);
}

// Runs a bash script on Linux with the Node version in .nvmrc: directly on
// Linux, through WSL on Windows. Inputs reach the script as environment
// variables, never as script text: `values` as they are, `paths` converted to
// their Linux form (WSLENV's /p flag on Windows). Exit status 3 means no
// Linux Node.
function runOnLinux(lines, { paths = {}, values = {} } = {}) {
  const script = [
    "set -e",
    'if [ -s "$HOME/.nvm/nvm.sh" ]; then . "$HOME/.nvm/nvm.sh"; nvm use "$NODE_VERSION" >/dev/null; fi',
    'case "$(command -v node)" in /mnt/*|"") echo "No Linux Node: install nvm and Node $NODE_VERSION"; exit 3;; esac',
    ...lines,
  ].join("\n");
  const vars = { NODE_VERSION: nodeVersion, ...values };
  const env = { ...process.env, ...vars, ...paths };
  if (isWindows) {
    env.WSLENV = [
      process.env.WSLENV,
      ...Object.keys(vars),
      ...Object.keys(paths).map((name) => `${name}/p`),
    ]
      .filter(Boolean)
      .join(":");
  }
  const [command, args] = isWindows ? ["wsl", ["-e", "bash", "-c", script]] : ["bash", ["-c", script]];
  return spawnSync(command, args, { cwd: root, stdio: "inherit", env });
}

function linuxUnavailable(result) {
  return result.error || result.status === 3 || result.status === -1;
}

function checkLockfile() {
  if (!existsSync(lockfile)) return { skipped: "no package-lock.json" };
  const result = runOnLinux(
    [
      'dir=$(mktemp -d); trap \'rm -rf "$dir"\' EXIT',
      'cp "$PACKAGE_JSON" "$LOCKFILE" "$dir"/',
      'cd "$dir"',
      'echo "Linux: node $(node -v), npm $(npm -v)"',
      "npm ci --dry-run --ignore-scripts --no-audit --no-fund",
    ],
    { paths: { PACKAGE_JSON: join(root, "package.json"), LOCKFILE: lockfile } },
  );
  if (linuxUnavailable(result)) {
    return { skipped: "no Linux Node (WSL on Windows), so this was not checked on Linux" };
  }
  return { ok: result.status === 0 };
}

// The query suite and paths-ignore of .github/workflows/codeql.yml.
function codeqlSettings() {
  const workflow = readFileSync(join(root, ".github", "workflows", "codeql.yml"), "utf8").replace(/\r\n/g, "\n");
  const suite = /^\s*queries:\s*(\S+)/m.exec(workflow)?.[1] ?? "code-scanning";
  const block = /^(\s*)config:\s*\|\s*\n((?:\1\s+.*\n?)*)/m.exec(workflow);
  const config = block ? block[2].replace(new RegExp(`^${block[1]}  `, "gm"), "") : "";
  return { suite, config };
}

function checkCodeql() {
  if (process.platform === "darwin") return { skipped: "CodeQL here runs on Linux or Windows (WSL) only" };
  const { suite, config } = codeqlSettings();
  const work = mkdtempSync(join(tmpdir(), "ci-local-codeql-"));
  try {
    // What git would commit: tracked and new files, not ignored ones (.env).
    const files = spawnSync("git", ["ls-files", "-co", "--exclude-standard"], { cwd: root, encoding: "utf8" });
    if (files.status !== 0) return { ok: false };
    writeFileSync(join(work, "files.txt"), files.stdout.split("\n").filter((f) => f && existsSync(join(root, f))).join("\n"));
    writeFileSync(join(work, "config.yml"), config);
    const sarifPath = join(work, "results.sarif");

    const result = runOnLinux(
      [
        'version="$CODEQL_VERSION"',
        'codeql_dir="$HOME/.cache/codeql/$version"',
        'if [ ! -x "$codeql_dir/codeql/codeql" ]; then',
        '  echo "Downloading CodeQL $version (about 140 MB, first run only)"',
        '  mkdir -p "$codeql_dir"',
        '  curl -fsSL "https://github.com/github/codeql-action/releases/download/codeql-bundle-v$version/codeql-bundle-javascript-linux64.tar.zst" \\',
        "    | node -e 'process.stdin.pipe(require(\"zlib\").createZstdDecompress()).pipe(process.stdout)' \\",
        '    | tar -x -C "$codeql_dir" || { rm -rf "$codeql_dir"; exit 1; }',
        "fi",
        'codeql="$codeql_dir/codeql/codeql"',
        'echo "$($codeql version | head -1), suite: $SUITE"',
        'tmp=$(mktemp -d); trap \'rm -rf "$tmp"\' EXIT',
        'mkdir "$tmp/src"',
        'tr -d "\\r" < "$WORK/files.txt" > "$tmp/files.txt"',
        'tar -C "$ROOT" -cf - -T "$tmp/files.txt" | tar -C "$tmp/src" -xf -',
        '"$codeql" database create "$tmp/db" --language=javascript-typescript --build-mode=none --source-root="$tmp/src" --codescanning-config="$WORK/config.yml" --threads=0 --ram=3072 --quiet >"$tmp/create.log" 2>&1 || { tail -20 "$tmp/create.log"; exit 1; }',
        '"$codeql" database analyze "$tmp/db" "codeql/javascript-queries:codeql-suites/javascript-$SUITE.qls" --format=sarif-latest --output="$WORK/results.sarif" --threads=0 --ram=3072 --quiet 2>&1 | grep -v "Not caching stages" || true',
        'test -s "$WORK/results.sarif"',
      ],
      { paths: { ROOT: root, WORK: work }, values: { CODEQL_VERSION, SUITE: suite } },
    );
    if (linuxUnavailable(result)) {
      return { skipped: "no Linux Node (WSL on Windows), so CodeQL could not run" };
    }
    if (result.status !== 0 || !existsSync(sarifPath)) return { ok: false };
    return reportCodeql(JSON.parse(readFileSync(sarifPath, "utf8")));
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

// GitHub blocks a pull request on security alerts of high severity or more
// (security-severity 7.0+), and on other alerts at level "error".
function reportCodeql(sarif) {
  const run = sarif.runs[0];
  const rules = new Map(
    [run.tool.driver, ...(run.tool.extensions ?? [])].flatMap((t) => t.rules ?? []).map((r) => [r.id, r]),
  );
  const accepted = existsSync(acceptedAlertsFile) ? JSON.parse(readFileSync(acceptedAlertsFile, "utf8")) : [];
  const used = new Set();
  let blocking = 0;
  for (const result of run.results) {
    const rule = rules.get(result.ruleId) ?? {};
    const severity = Number(rule.properties?.["security-severity"] ?? NaN);
    const level = result.level ?? rule.defaultConfiguration?.level ?? "warning";
    const location = result.locations[0].physicalLocation;
    const file = decodeURIComponent(location.artifactLocation.uri);
    const where = `${file}:${location.region.startLine}`;
    const label = Number.isNaN(severity) ? level : `${severity.toFixed(1)} ${severity >= 9 ? "critical" : severity >= 7 ? "high" : severity >= 4 ? "medium" : "low"}`;
    const acceptance = accepted.findIndex((a) => a.rule === result.ruleId && a.file === file);
    if (acceptance >= 0) {
      used.add(acceptance);
      console.log(`accepted  ${result.ruleId} ${where}\n          ${accepted[acceptance].reason}`);
      continue;
    }
    const blocks = Number.isNaN(severity) ? level === "error" : severity >= 7;
    if (blocks) blocking++;
    console.log(`${blocks ? "BLOCKING" : "note    "}  [${label}] ${result.ruleId} ${where}\n          ${result.message.text.split("\n")[0]}`);
  }
  accepted.forEach((a, i) => {
    if (!used.has(i)) console.log(`unused    ${a.rule} ${a.file}: no longer reported, remove it from accepted-alerts.json`);
  });
  console.log(`${run.results.length} CodeQL results, ${blocking} would block the pull request`);
  return { ok: blocking === 0 };
}

function checkAdvisories() {
  if (!existsSync(lockfile)) return { skipped: "no package-lock.json" };
  const result = npm(["audit", "--package-lock-only", "--json"], { stdio: ["ignore", "pipe", "inherit"] });
  let report;
  try {
    report = JSON.parse(result.stdout.toString());
  } catch {
    console.error("npm audit did not return a report (offline?)");
    return { ok: false };
  }
  if (report.error) {
    console.error(`npm audit failed: ${report.error.summary ?? report.error.code}`);
    return { ok: false };
  }
  const serious = Object.values(report.vulnerabilities ?? {}).filter((v) =>
    ["high", "critical"].includes(v.severity),
  );
  for (const v of serious) {
    const advisories = v.via.filter((via) => typeof via === "object");
    console.log(`${v.severity.padEnd(8)} ${v.name} ${v.range}`);
    for (const a of advisories) console.log(`         ${a.title} ${a.url}`);
    if (advisories.length === 0) console.log(`         through ${v.via.join(", ")}`);
  }
  const counts = report.metadata?.vulnerabilities ?? {};
  console.log(
    `${serious.length} packages with high or critical advisories (moderate: ${counts.moderate ?? 0}, low: ${counts.low ?? 0})`,
  );
  return { ok: serious.length === 0 };
}

const checks = [
  ["lockfile", checkLockfile],
  ["advisories", checkAdvisories],
  ["lint", () => ({ ok: npm(["run", "lint"]).status === 0 })],
  ["typecheck", () => ({ ok: npm(["run", "typecheck"]).status === 0 })],
  ["test", () => ({ ok: npm(["test"]).status === 0 })],
  ...(process.argv.includes("--codeql") ? [["codeql", checkCodeql]] : []),
];

const results = [];
for (const [name, check] of checks) {
  console.log(`\n== ${name} ==`);
  results.push([name, check()]);
}

console.log("\n== summary ==");
for (const [name, result] of results) {
  const status = result.skipped ? `skipped: ${result.skipped}` : result.ok ? "passed" : "FAILED";
  console.log(`${name.padEnd(11)} ${status}`);
}
process.exit(results.some(([, result]) => result.ok === false) ? 1 : 0);
