import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * The app shows only what is in the database. Demo content is seeded
 * (prisma/seed.ts, prisma/seed-data.ts) and never imported by app code.
 * This fails if sample data or a fallback to it comes back.
 */

const ROOT = join(__dirname, "..");
const APP_DIRS = [
  "app",
  "components",
  "lib",
  "config",
  "hooks",
  "store",
  "i18n",
];

function sourceFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !/\.(test|fixture)\.ts$/.test(name)
      ? [path]
      : [];
  });
}

const files = APP_DIRS.flatMap((d) => sourceFiles(join(ROOT, d))).map(
  (path) => ({
    path: relative(ROOT, path).replace(/\\/g, "/"),
    text: readFileSync(path, "utf8"),
  }),
);

const FORBIDDEN: [string, RegExp][] = [
  ["sample identifiers", /\b(sample[A-Z]\w*|SAMPLE_\w+|getSample\w*)\b/],
  ["sample modules", /from ["'][^"']*\b(sample\w*|mockData|fakeData)["']/i],
  ["seed data in app code", /from ["'][^"']*prisma\/seed[^"']*["']/],
  ["a sample-only switch", /\b(BUSINESS_SOURCE|LISTINGS_SOURCE)\b/],
];

describe("no sample data in app code", () => {
  it("scans the app", () => {
    expect(files.length).toBeGreaterThan(100);
  });

  for (const [what, pattern] of FORBIDDEN) {
    it(`has no ${what}`, () => {
      const hits = files.filter((f) => pattern.test(f.text)).map((f) => f.path);
      expect(hits).toEqual([]);
    });
  }

  it("has deleted the old sample modules", () => {
    for (const path of [
      "lib/sampleUserShops.ts",
      "lib/business/sampleStorefronts.ts",
      "lib/business/directory/sampleDirectory.ts",
      "lib/listings/sampleDetails.ts",
    ]) {
      expect([path, existsSync(join(ROOT, path))]).toEqual([path, false]);
    }
  });
});
