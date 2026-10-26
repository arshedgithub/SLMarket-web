import { categories } from "@/config/const/navLinks";
import { SRI_LANKA_DISTRICTS } from "@/config/const/sriLankaLocations";
import type { DirectoryBusiness, DirectoryItem } from "./types";

/*
 * The search behaviour, as pure functions: typo tolerance, synonyms, price
 * terms ("under 1 lakh", "50k"), brands ("Apple dealer Kandy") and a
 * district. It runs over the directory in memory today; the same rules map onto a
 * real engine (Typesense, Meilisearch, OpenSearch) with two indexes:
 * businesses, and ads grouped by business.
 */

// Grown over time from real search logs. Singlish and transliterated Sinhala
// or Tamil terms belong here too.
export const SYNONYM_GROUPS: string[][] = [
  ["phone", "mobile", "smartphone", "cellphone", "cell"],
  ["ac", "air conditioner", "air conditioning", "aircon", "air con"],
  ["laptop", "notebook"],
  [
    "three wheeler",
    "three-wheeler",
    "threewheeler",
    "tuk",
    "tuktuk",
    "tuk tuk",
  ],
  ["bike", "motorcycle", "motorbike"],
  ["tv", "television"],
  ["fridge", "refrigerator"],
  ["washing machine", "washer"],
  ["salon", "beauty parlour", "parlour"],
  ["shop", "store", "kade"],
  ["earphones", "headphones", "earbuds"],
];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const PHRASES: { re: RegExp; canon: string }[] = SYNONYM_GROUPS.flatMap((g) =>
  g
    .slice(1)
    .concat()
    .map((term) => ({ term, canon: g[0] }))
    .sort((a, b) => b.term.length - a.term.length)
    .map(({ term, canon }) => ({
      re: new RegExp(
        `(?<![\\p{L}\\p{N}])${escapeRe(term)}(?![\\p{L}\\p{N}])`,
        "gu",
      ),
      canon,
    })),
);

export function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.,'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function canonicalise(text: string): string {
  let out = normalise(text);
  for (const { re, canon } of PHRASES) out = out.replace(re, canon);
  return out;
}

const tokens = (text: string) =>
  canonicalise(text)
    .split(/[\s,.'-]+/)
    .filter(Boolean);

/* ---------------- fuzzy token matching ---------------- */

function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let last = prev[0];
    prev[0] = i;
    let rowMin = prev[0];
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        last + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      last = tmp;
      rowMin = Math.min(rowMin, prev[j]);
    }
    if (rowMin > max) return max + 1;
  }
  return prev[b.length];
}

// 1 exact, 0.85 prefix, 0.7 one typo, 0.6 two typos on long words, 0 no match.
export function tokenSimilarity(q: string, d: string): number {
  if (q === d) return 1;
  if (q.length >= 3 && d.startsWith(q)) return 0.85;
  if (q.length >= 4) {
    const dist = editDistance(q, d, q.length >= 8 ? 2 : 1);
    if (dist === 1) return 0.7;
    if (dist === 2 && q.length >= 8) return 0.6;
  }
  return 0;
}

// Every query token must find a match; the score is the average of the best
// matches. Any missing token means no match at all.
export function matchTokens(query: string[], doc: string[]): number {
  if (query.length === 0 || doc.length === 0) return 0;
  let sum = 0;
  for (const q of query) {
    let best = 0;
    for (const d of doc) {
      const s = tokenSimilarity(q, d);
      if (s > best) best = s;
      if (best === 1) break;
    }
    if (best === 0) return 0;
    sum += best;
  }
  return sum / query.length;
}

/* ---------------- query parsing ---------------- */

const UNIT: Record<string, number> = {
  k: 1e3,
  lakh: 1e5,
  lakhs: 1e5,
  lac: 1e5,
  lacs: 1e5,
  m: 1e6,
  million: 1e6,
};

function amountOf(num: string, unit?: string) {
  const n = Number(num.replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * (unit ? (UNIT[unit] ?? 1) : 1));
}

const AMOUNT = String.raw`(?:rs\.?\s*)?(\d[\d,]*(?:\.\d+)?)\s*(k|lakhs?|lacs?|million|m)?\b`;

export type ParsedQuery = {
  text: string; // what is left to match against names and items
  minPrice: number | null;
  maxPrice: number | null;
  district: string | null;
  brand: string | null;
  authorisedIntent: boolean;
};

export function parseQuery(
  raw: string,
  knownBrands: string[] = [],
): ParsedQuery {
  let text = ` ${normalise(raw)} `;
  let minPrice: number | null = null;
  let maxPrice: number | null = null;

  const upper = new RegExp(
    String.raw`\s(?:under|below|less than|max|upto|up to|within|<)\s*${AMOUNT}`,
    "i",
  );
  const lower = new RegExp(
    String.raw`\s(?:above|over|more than|min|from|>)\s*${AMOUNT}`,
    "i",
  );
  let m = text.match(upper);
  if (m) {
    maxPrice = amountOf(m[1], m[2]?.toLowerCase());
    text = text.replace(m[0], " ");
  }
  m = text.match(lower);
  if (m) {
    minPrice = amountOf(m[1], m[2]?.toLowerCase());
    text = text.replace(m[0], " ");
  }
  // A bare amount counts as a price only with a unit or "Rs" ("50k",
  // "Rs. 100,000"): "iPhone 15" must stay a product name.
  const bare = text.match(
    new RegExp(
      String.raw`\s(?:rs\.?\s*(\d[\d,]*(?:\.\d+)?)\s*(k|lakhs?|lacs?|million|m)?|(\d[\d,]*(?:\.\d+)?)\s*(k|lakhs?|lacs?|million))(?=\s)`,
      "i",
    ),
  );
  if (bare && maxPrice === null) {
    maxPrice = amountOf(
      bare[1] ?? bare[3],
      (bare[2] ?? bare[4])?.toLowerCase(),
    );
    text = text.replace(bare[0], " ");
  }

  let district: string | null = null;
  for (const d of SRI_LANKA_DISTRICTS) {
    const name = d.name.toLowerCase();
    const re = new RegExp(`(?<![\\p{L}])${escapeRe(name)}(?![\\p{L}])`, "u");
    if (re.test(text)) {
      district = d.name;
      text = text.replace(re, " ");
      break;
    }
  }

  const authorisedIntent = /\b(authori[sz]ed|dealer)\b/.test(text);
  text = text.replace(
    /\b(authori[sz]ed|dealer|dealers|in|near|shops?)\b/g,
    " ",
  );

  let brand: string | null = null;
  for (const b of knownBrands) {
    const re = new RegExp(
      `(?<![\\p{L}])${escapeRe(b.toLowerCase())}(?![\\p{L}])`,
      "u",
    );
    if (re.test(text)) {
      brand = b;
      break;
    }
  }

  return {
    text: text.replace(/\s+/g, " ").trim(),
    minPrice,
    maxPrice,
    district,
    brand,
    authorisedIntent,
  };
}

/* ---------------- searching ---------------- */

export type SearchHit = {
  business: DirectoryBusiness;
  relevance: number; // 0..1
  nameMatch: boolean;
  matchedItems: DirectoryItem[];
  priceRange: { min: number; max: number } | null;
};

function itemTokens(i: DirectoryItem) {
  return tokens(`${i.title} ${i.brand ?? ""} ${i.category}`);
}

export function searchBusinesses(
  raw: string,
  list: DirectoryBusiness[],
  knownBrands: string[] = [],
): { hits: SearchHit[]; parsed: ParsedQuery } {
  const parsed = parseQuery(raw, knownBrands);
  const q = tokens(parsed.text);
  const hits: SearchHit[] = [];

  for (const b of list) {
    let nameScore = 0;
    let fieldScore = 0;
    let matched: { item: DirectoryItem; score: number }[] = [];

    if (q.length > 0) {
      nameScore = matchTokens(q, tokens(b.name));
      fieldScore = matchTokens(
        q,
        tokens(
          [
            b.typeLabel,
            b.tagline,
            b.city,
            b.district,
            ...b.authorisedBrands,
            ...b.otherBrands,
          ].join(" "),
        ),
      );
      matched = b.items
        .map((item) => ({ item, score: matchTokens(q, itemTokens(item)) }))
        .filter((m) => m.score >= 0.6)
        .sort((a, c) => c.score - a.score);
    }

    // No text left (only price / brand / district filters): everything is a
    // candidate, ranked by the filters alone.
    const textless = q.length === 0;
    const itemScore = matched[0]?.score ?? 0;
    const relevance = textless
      ? 0.6
      : Math.max(nameScore, fieldScore * 0.7, itemScore * 0.85);
    if (relevance <= 0) continue;

    let items = matched.map((m) => m.item);
    if (parsed.maxPrice !== null)
      items = items.filter((i) => i.price <= parsed.maxPrice!);
    if (parsed.minPrice !== null)
      items = items.filter((i) => i.price >= parsed.minPrice!);
    if (!textless && nameScore < 0.85 && fieldScore === 0 && items.length === 0)
      continue;

    let brandBoost = 0;
    if (parsed.brand) {
      const authorised = b.authorisedBrands.some(
        (x) => x.toLowerCase() === parsed.brand!.toLowerCase(),
      );
      const carries =
        authorised ||
        b.otherBrands.some(
          (x) => x.toLowerCase() === parsed.brand!.toLowerCase(),
        );
      if (!carries) continue;
      brandBoost = authorised ? 0.25 : 0.05;
    }

    hits.push({
      business: b,
      relevance: Math.min(1, relevance + brandBoost),
      nameMatch: nameScore >= 0.85,
      matchedItems: items,
      priceRange: items.length
        ? {
            min: Math.min(...items.map((i) => i.price)),
            max: Math.max(...items.map((i) => i.price)),
          }
        : null,
    });
  }
  return { hits, parsed };
}

/* ---------------- categories and suggestions ---------------- */

export function matchCategory(
  raw: string,
): { categoryId: string; subcategoryId?: string; name: string } | null {
  const q = tokens(raw);
  if (q.length === 0) return null;
  let best: {
    categoryId: string;
    subcategoryId?: string;
    name: string;
    score: number;
  } | null = null;
  for (const c of categories) {
    const cs = matchTokens(q, tokens(c.name));
    if (cs >= 0.85 && (!best || cs > best.score))
      best = { categoryId: c.id, name: c.name, score: cs };
    for (const s of c.subcategories) {
      const ss = matchTokens(q, tokens(s.name));
      if (ss >= 0.85 && (!best || ss > best.score)) {
        best = {
          categoryId: c.id,
          subcategoryId: s.id,
          name: s.name,
          score: ss,
        };
      }
    }
  }
  return best;
}

export type Suggestions = {
  businesses: DirectoryBusiness[];
  products: { title: string; count: number; minPrice: number }[];
  categories: { categoryId: string; subcategoryId?: string; name: string }[];
};

export function suggest(
  raw: string,
  list: DirectoryBusiness[],
  knownBrands: string[] = [],
): Suggestions {
  if (normalise(raw).length < 2)
    return { businesses: [], products: [], categories: [] };
  const { hits } = searchBusinesses(raw, list, knownBrands);
  const businesses = hits
    .filter((h) => h.nameMatch)
    .sort(
      (a, b) =>
        b.relevance - a.relevance || a.business.id.localeCompare(b.business.id),
    )
    .slice(0, 3)
    .map((h) => h.business);

  const byTitle = new Map<
    string,
    { title: string; count: number; minPrice: number }
  >();
  for (const h of hits) {
    for (const item of h.matchedItems) {
      const key = normalise(item.title);
      const cur = byTitle.get(key);
      if (cur) {
        cur.count += 1;
        cur.minPrice = Math.min(cur.minPrice, item.price);
      } else {
        byTitle.set(key, { title: item.title, count: 1, minPrice: item.price });
      }
    }
  }
  const products = [...byTitle.values()]
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
    .slice(0, 4);

  const cat = matchCategory(raw);
  return { businesses, products, categories: cat ? [cat] : [] };
}
