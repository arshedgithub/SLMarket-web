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
//
// Not covered: the production build and smoke test, which need a database.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lockfile = join(root, "package-lock.json");
const nodeVersion = readFileSync(join(root, ".nvmrc"), "utf8").trim();
const isWindows = process.platform === "win32";

function run(command, args, options = {}) {
  return spawnSync(command, args, { cwd: root, stdio: "inherit", ...options });
}

// The npm that started this script when run through `npm run` (on Windows,
// npm.cmd from inside `npm run` can resolve to a missing npm), else the one
// on PATH.
function npm(args, options = {}) {
  const cli = process.env.npm_execpath;
  if (cli && /npm-cli\.[cm]?js$/.test(cli)) return run(process.execPath, [cli, ...args], options);
  return isWindows ? run(`npm ${args.join(" ")}`, [], { shell: true, ...options }) : run("npm", args, options);
}

function checkLockfile() {
  if (!existsSync(lockfile)) return { skipped: "no package-lock.json" };

  if (!isWindows) {
    const dir = mkdtempSync(join(tmpdir(), "ci-local-"));
    try {
      copyFileSync(join(root, "package.json"), join(dir, "package.json"));
      copyFileSync(lockfile, join(dir, "package-lock.json"));
      const result = npm(["ci", "--dry-run", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: dir });
      return { ok: result.status === 0 };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  const script = [
    "set -e",
    `if [ -s "$HOME/.nvm/nvm.sh" ]; then . "$HOME/.nvm/nvm.sh"; nvm use ${nodeVersion} >/dev/null; fi`,
    'case "$(command -v npm)" in /mnt/*|"") echo "WSL has no Linux npm: install nvm and Node ' + nodeVersion + ' there"; exit 3;; esac',
    'dir=$(mktemp -d); trap \'rm -rf "$dir"\' EXIT',
    `cp "$(wslpath -a '${join(root, "package.json")}')" "$(wslpath -a '${lockfile}')" "$dir"/`,
    'cd "$dir"',
    'echo "WSL: node $(node -v), npm $(npm -v)"',
    "npm ci --dry-run --ignore-scripts --no-audit --no-fund",
  ].join("\n");
  const result = run("wsl", ["-e", "bash", "-c", script]);
  if (result.error || result.status === 3 || result.status === -1) {
    return { skipped: "WSL with Node is not available, so this was not checked on Linux" };
  }
  return { ok: result.status === 0 };
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
