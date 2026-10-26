import type { DirectoryResult } from "./query";

/*
 * Up to 2 sponsored businesses at the top of a page of results.
 *  - Only when relevant: the business's plan must cover the category on
 *    this page, and it must already pass the current filters, search and
 *    distance (candidates arrive from the same query as the organic list).
 *    With nobody eligible the slots stay empty; organic results fill them.
 *  - Between eligible businesses: fair rotation by how much of today's
 *    plan each has used, then anyone this visitor already saw this session
 *    goes to the back.
 *  - A sponsored business is removed from the organic list on the page.
 * Payment never touches organic ranking.
 */

export const MAX_SPONSORED = 2;

export function selectSponsored(
  results: DirectoryResult[],
  categoryId: string | null,
  seenIds: string[],
  max = MAX_SPONSORED,
): DirectoryResult[] {
  const eligible = results.filter((r) => {
    const plan = r.business.sponsored;
    if (!plan) return false;
    return categoryId === null || plan.categoryIds.includes(categoryId);
  });

  const usage = (r: DirectoryResult) => {
    const plan = r.business.sponsored!;
    return plan.dailyPlan > 0 ? plan.impressionsToday / plan.dailyPlan : 1;
  };

  return [...eligible]
    .sort((a, b) => {
      const seenA = seenIds.includes(a.business.id) ? 1 : 0;
      const seenB = seenIds.includes(b.business.id) ? 1 : 0;
      return (
        seenA - seenB ||
        usage(a) - usage(b) ||
        a.business.id.localeCompare(b.business.id)
      );
    })
    .slice(0, max);
}

// Organic results for the page: the sponsored ones are never shown twice.
export function withoutSponsored(
  results: DirectoryResult[],
  sponsored: DirectoryResult[],
) {
  const ids = new Set(sponsored.map((s) => s.business.id));
  return results.filter((r) => !ids.has(r.business.id));
}
