// The fixed list a business picks its highlights from (never free text).
export const BUSINESS_HIGHLIGHTS = [
  "delivery",
  "warranty",
  "easyPayments",
  "cod",
  "returns",
  "inspection",
  "leasing",
  "consultation",
  "siteVisits",
  "assembly",
  "freshness",
] as const;
export type BusinessHighlight = (typeof BUSINESS_HIGHLIGHTS)[number];

// A page shows at most this many highlight chips.
export const MAX_HIGHLIGHT_CHIPS = 4;
