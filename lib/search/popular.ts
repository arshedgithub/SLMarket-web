import type { AdCard } from "@/app/[locale]/(root)/ads/_components/data";
import {
  popularSearches,
  type PopularSearch,
} from "@/lib/listings/popularSearches";
import { topSearchTerms } from "./terms";

// Server: popular searches from what people searched for, checked against
// the live ads.
export async function getPopularSearches(
  ads: AdCard[],
  max = 6,
): Promise<PopularSearch[]> {
  return popularSearches(ads, max, await topSearchTerms());
}
