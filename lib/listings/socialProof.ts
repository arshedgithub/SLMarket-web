/*
 * Numbers are shown only when they flatter the marketplace: a "1 ad" or
 * "0 ads" label signals an empty place, so below these thresholds the
 * label is left out (or replaced with a neutral one).
 */

// Category and district counts ("124 ads").
export const COUNT_MIN = 25;
// "8 new today".
export const NEW_TODAY_MIN = 5;
// "X people viewed this" on an ad.
export const VIEWS_MIN = 25;

export const showCount = (n: number) => n >= COUNT_MIN;
export const showNewToday = (n: number) => n >= NEW_TODAY_MIN;
export const showViews = (n: number | null | undefined): n is number =>
  (n ?? 0) >= VIEWS_MIN;
