import type { AdCard } from "@/app/[locale]/(root)/ads/_components/data";
import { matchesSearch } from "@/app/[locale]/(root)/ads/_components/adQuery";

/*
 * The one list of popular searches (homepage hero, /ads, the categories
 * menu). Terms Sri Lankan buyers search for most, ranked by how many live
 * ads each finds right now; a term with no ads is left out, so a chip never
 * leads to an empty page. Update TERMS from search logs.
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

export function popularSearches(
  ads: AdCard[],
  max = POPULAR_MAX,
): PopularSearch[] {
  const counted = TERMS.map((label, i) => ({
    label,
    href: `/ads?q=${encodeURIComponent(label)}`,
    count: ads.filter((a) => matchesSearch(a, label)).length,
    order: i,
  })).filter((t) => t.count > 0);

  // A broader term (iPhone) adds nothing when a narrower one (iPhone 16)
  // finds the same ads.
  const kept = counted.filter(
    (t) =>
      !counted.some(
        (o) =>
          o !== t && o.label.startsWith(`${t.label} `) && o.count === t.count,
      ),
  );
  return kept
    .sort((a, b) => b.count - a.count || a.order - b.order)
    .slice(0, max)
    .map(({ label, href, count }) => ({ label, href, count }));
}
