import { cache } from "react";
import { db } from "@/lib/db";
import { withTimeout } from "@/lib/business/dbGuard";
import { colomboDay } from "@/lib/listings/feed";

/*
 * Search terms, counted per day: what feeds "Popular searches". Raw SQL so
 * this small table needs no generated client model.
 */

const MAX_LEN = 60;
// A term needs this many searches in the window to count as popular.
export const MIN_SEARCHES = 3;
const WINDOW_DAYS = 30;

// "  iPhone   16!! " -> "iphone 16". Null for anything that is not a search
// (too short, no letters, a phone number or a link).
export function normalizeTerm(raw: string): string | null {
  const term = raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'&.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_LEN);
  if (term.length < 2 || !/\p{L}/u.test(term)) return null;
  if (/\d{7,}/.test(term.replace(/\s/g, "")) || /https?|www\./.test(raw))
    return null;
  return term;
}

export async function recordSearch(raw: string): Promise<void> {
  const term = normalizeTerm(raw);
  if (!term) return;
  const day = colomboDay();
  await db.$executeRaw`
    INSERT INTO "search_terms_daily" ("term", "day", "count")
    VALUES (${term}, ${day}::date, 1)
    ON CONFLICT ("term", "day") DO UPDATE SET "count" = "search_terms_daily"."count" + 1`;
}

// The most searched terms of the last 30 days, most popular first.
export const topSearchTerms = cache(async (limit = 30): Promise<string[]> => {
  try {
    const rows = await withTimeout(
      db.$queryRaw<{ term: string }[]>`
        SELECT "term" FROM "search_terms_daily"
        WHERE "day" >= (CURRENT_DATE - ${WINDOW_DAYS}::int)
        GROUP BY "term"
        HAVING SUM("count") >= ${MIN_SEARCHES}
        ORDER BY SUM("count") DESC, "term"
        LIMIT ${limit}`,
      3000,
    );
    return rows.map((r) => r.term);
  } catch {
    return [];
  }
});
