import type { AdCard } from "@/app/[locale]/(root)/ads/_components/data";
import { matchesSearch } from "@/app/[locale]/(root)/ads/_components/adQuery";

/*
 * The one list of popular searches (homepage hero, /ads, the categories
 * menu). What people actually searched for in the last 30 days comes first
 * (lib/search/terms.ts); until there is enough of that, a starter list of
 * terms Sri Lankan buyers look for fills in. A term that finds no live ad
 * is left out, so a chip never leads to an empty page.
 */
export const TERMS = [
  "iPhone 16",
  "iPhone",
  "Wagon R",
  "Toyota",
  "Land for sale",
  "House for rent",
  "Boarding room",
  "Part-time job",
  "Three wheeler",
  "Laptop",
  "Motorbike",
  "Apartment",
] as const;

export type PopularSearch = { label: string; href: string; count: number };

export const POPULAR_MAX = 6;

// Logged terms are lower case: show the starter list's spelling when it
// is the same term ("iphone 16" -> "iPhone 16"), else capitalise.
function displayLabel(term: string): string {
  const known = TERMS.find((t) => t.toLowerCase() === term.toLowerCase());
  return known ?? term.charAt(0).toUpperCase() + term.slice(1);
}

export function popularSearches(
  ads: AdCard[],
  max = POPULAR_MAX,
  searched: string[] = [],
): PopularSearch[] {
  const seen = new Set<string>();
  const candidates = [
    ...searched.map((term, i) => ({ label: displayLabel(term), rank: i })),
    ...TERMS.map((label, i) => ({ label, rank: searched.length + 100 + i })),
  ].filter((c) => {
    const key = c.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const counted = candidates
    .map((c) => ({
      ...c,
      href: `/ads?q=${encodeURIComponent(c.label)}`,
      count: ads.filter((a) => matchesSearch(a, c.label)).length,
    }))
    .filter((t) => t.count > 0);

  // A broader term (iPhone) adds nothing when a narrower one (iPhone 16)
  // finds the same ads.
  const kept = counted.filter(
    (t) =>
      !counted.some(
        (o) =>
          o !== t &&
          o.label.toLowerCase().startsWith(`${t.label.toLowerCase()} `) &&
          o.count === t.count,
      ),
  );
  // Searched terms keep their popularity order; starter terms go by how
  // many ads they find.
  return kept
    .sort((a, b) => {
      const aSearched = a.rank < searched.length;
      const bSearched = b.rank < searched.length;
      if (aSearched !== bSearched) return aSearched ? -1 : 1;
      return aSearched ? a.rank - b.rank : b.count - a.count || a.rank - b.rank;
    })
    .slice(0, max)
    .map(({ label, href, count }) => ({ label, href, count }));
}
