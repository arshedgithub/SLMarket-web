import { categories } from "@/config/const/navLinks";
import {
  DEAL_VALUES,
  type AdCard,
  type DealTag,
} from "@/app/[locale]/(root)/ads/_components/data";
import {
  filterAds,
  filtersFromParams,
} from "@/app/[locale]/(root)/ads/_components/adQuery";
import {
  DEAL_ROUTE_TYPES,
  parseDealRouteType,
} from "@/app/[locale]/(root)/ads/_components/dealRoutes";

/*
 * A saved search is an /ads URL (path and query, no locale, no page), so
 * the alert job finds new ads with the same rules as the page itself.
 */

const LOCALE_PREFIX = /^\/(en|si|ta)(?=\/)/;

export function normalizeSearchQuery(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw, "https://slmarket.lk");
  } catch {
    return null;
  }
  const path = url.pathname.replace(LOCALE_PREFIX, "").replace(/\/+$/, "");
  if (!/^\/ads(\/[a-z0-9-]+){0,2}$/.test(path)) return null;
  url.searchParams.delete("page");
  url.searchParams.sort();
  const qs = url.searchParams.toString();
  return (qs ? `${path}?${qs}` : path).slice(0, 500);
}

type ParsedSearch = {
  categoryId: string | null;
  subcategoryId: string | null;
  dealScope: DealTag[] | null;
  params: URLSearchParams;
};

export function parseSearchQuery(query: string): ParsedSearch | null {
  const url = new URL(query, "https://slmarket.lk");
  const [, , first, second] = url.pathname.split("/");
  if (first === "deals") {
    const type = parseDealRouteType(second);
    return {
      categoryId: null,
      subcategoryId: null,
      dealScope: type ? [DEAL_ROUTE_TYPES[type].tag] : DEAL_VALUES,
      params: url.searchParams,
    };
  }
  const category = first ? categories.find((c) => c.id === first) : null;
  if (first && !category) return null;
  const sub = second
    ? category?.subcategories.find((s) => s.id === second)
    : null;
  if (second && !sub) return null;
  return {
    categoryId: category?.id ?? null,
    subcategoryId: sub?.id ?? null,
    dealScope: null,
    params: url.searchParams,
  };
}

// The ads in `ads` that the saved search would list, newest first.
export function adsForSavedSearch(ads: AdCard[], query: string): AdCard[] {
  const parsed = parseSearchQuery(query);
  if (!parsed) return [];
  return filterAds(ads, {
    categoryId: parsed.categoryId,
    subcategoryId: parsed.subcategoryId,
    search: parsed.params.get("q") ?? "",
    filters: filtersFromParams(
      parsed.params,
      parsed.categoryId,
      parsed.dealScope,
    ),
    sort: "newest",
  });
}
