#!/usr/bin/env node
/*
 * Type-check with a ratchet.
 *
 * Some legacy code (seller subscriptions, PayHere billing, reels, the old
 * dashboard and admin views) was written against an older database schema
 * and does not type-check. Until it is rewritten or removed, its errors are
 * recorded in typecheck-baseline.json, counted per file and error code
 * (not per line, so ordinary edits nearby do not trip it).
 *
 * This script fails when:
 *   - a file has an error that is not in the baseline (new code must be clean)
 *   - a file has more errors of a code than the baseline allows
 *   - the baseline allows more than exist (someone fixed errors: run
 *     `npm run typecheck:update` and commit, so the ratchet only tightens)
 *
 *   node scripts/ci/typecheck.mjs           check
 *   node scripts/ci/typecheck.mjs --update  rewrite the baseline
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const baselineFile = path.join(here, "typecheck-baseline.json");
const update = process.argv.includes("--update");

const tsc = spawnSync(
  process.execPath,
  [path.join(root, "node_modules/typescript/bin/tsc"), "--noEmit", "-p", root],
  { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);
const output = `${tsc.stdout}${tsc.stderr}`;

// "path/file.ts(12,5): error TS2339: message"
const ERROR = /^(.+?)\(\d+,\d+\): error (TS\d+): (.*)$/;
const current = {};
const messages = {};
let unparsed = 0;
for (const line of output.split(/\r?\n/)) {
  const m = ERROR.exec(line);
  if (!m) {
    if (/error TS\d+/.test(line)) unparsed++;
    continue;
  }
  const [, rawFile, code] = m;
  const file = rawFile.replace(/\\/g, "/");
  current[file] ??= {};
  current[file][code] = (current[file][code] ?? 0) + 1;
  (messages[`${file} ${code}`] ??= []).push(line);
}
// Errors without a file (bad tsconfig, missing types) are never baselined.
if (unparsed > 0 || (tsc.status !== 0 && Object.keys(current).length === 0)) {
  console.error(output);
  console.error("Type-check failed with errors outside any source file.");
  process.exit(1);
}

const sortKeys = (o) =>
  Object.fromEntries(
    Object.keys(o)
      .sort()
      .map((k) => [k, typeof o[k] === "object" ? sortKeys(o[k]) : o[k]]),
  );
const total = (o) =>
  Object.values(o).reduce(
    (n, codes) => n + Object.values(codes).reduce((a, b) => a + b, 0),
    0,
  );

if (update) {
  writeFileSync(baselineFile, `${JSON.stringify(sortKeys(current), null, 2)}\n`);
  console.log(
    `Baseline written: ${total(current)} known errors in ${Object.keys(current).length} files.`,
  );
  process.exit(0);
}

const baseline = existsSync(baselineFile)
  ? JSON.parse(readFileSync(baselineFile, "utf8"))
  : {};

const regressions = [];
const improvements = [];
for (const [file, codes] of Object.entries(current)) {
  for (const [code, count] of Object.entries(codes)) {
    const allowed = baseline[file]?.[code] ?? 0;
    if (count > allowed) regressions.push({ file, code, count, allowed });
  }
}
for (const [file, codes] of Object.entries(baseline)) {
  for (const [code, allowed] of Object.entries(codes)) {
    const count = current[file]?.[code] ?? 0;
    if (count < allowed) improvements.push({ file, code, count, allowed });
  }
}

const gh = process.env.GITHUB_ACTIONS === "true";
if (regressions.length) {
  console.error(`New type errors (${regressions.length} file/code pairs):\n`);
  for (const r of regressions) {
    console.error(`  ${r.file}  ${r.code}: ${r.count} (baseline ${r.allowed})`);
    for (const line of messages[`${r.file} ${r.code}`] ?? []) {
      console.error(`    ${line}`);
      const m = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/.exec(line);
      if (gh && m)
        console.log(
          `::error file=${m[1]},line=${m[2]},col=${m[3]},title=${m[4]}::${m[5]}`,
        );
    }
  }
}
if (improvements.length) {
  console.error(
    `\nFewer errors than the baseline allows (good). Tighten it so they cannot come back:\n`,
  );
  for (const i of improvements)
    console.error(`  ${i.file}  ${i.code}: ${i.count} (baseline ${i.allowed})`);
  console.error(`\n  npm run typecheck:update   then commit scripts/ci/typecheck-baseline.json`);
}
if (regressions.length || improvements.length) process.exit(1);

console.log(
  `Type-check passed: no new errors (${total(baseline)} known legacy errors in ${Object.keys(baseline).length} files).`,
);
