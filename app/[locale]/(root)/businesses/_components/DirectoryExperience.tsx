"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, BarChart3, MapPin, Search, X } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Pagination } from "@/app/[locale]/(root)/ads/_components/Pagination";
import Image from "next/image";
import { categoryAccent, categoryGlyphSrc } from "@/config/const/categoryIcons";
import { SRI_LANKA_DISTRICTS } from "@/config/const/sriLankaLocations";
import {
  DISTRICT_CENTRES,
  districtFromSlug,
  districtSlug,
  type LatLng,
} from "@/lib/business/directory/geo";
import {
  runDirectory,
  VERIFIED_MIN_LEVEL,
  type DirectoryResult,
  type QueryContext,
} from "@/lib/business/directory/query";
import { selectSponsored } from "@/lib/business/directory/sponsored";
import {
  DEFAULT_FILTERS,
  DISTANCE_OPTIONS,
  SORT_KEYS,
  type DeliveryFilter,
  type DirectoryBusiness,
  type DirectoryFilters,
} from "@/lib/business/directory/types";
import { trackBusinessEvent } from "./analytics";
import { DirectoryCard } from "./DirectoryCard";
import { AllFiltersSheet, HowRankingDialog } from "./Dialogs";
import { DirectoryFilterBar, type ViewMode } from "./FilterBar";
import { SearchBox } from "./SearchBox";
import { useNow } from "./useNow";
import type { MapBounds } from "./MapView";

// MapLibre touches `window`, and the map should only cost anything when the
// visitor actually opens Map view.
const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-[var(--color-market-blue-light)]" />
  ),
});

const PAGE_SIZE = 24;
const SEEN_KEY = "slm:directory:seen";
const CHIP_ORDER = [
  "electronics",
  "vehicles",
  "property",
  "services",
  "home-garden",
  "fashion",
  "food",
  "agriculture",
  "education",
];

export type DirectoryBase = {
  category: string | null;
  subcategory: string | null;
  district: string | null;
};

type Page = { sponsored: DirectoryResult[]; organic: DirectoryResult[] };

// Each page: up to 2 sponsored first, then organic to fill 24. A business is
// never shown twice, and a sponsored one is not repeated as organic.
function buildPages(
  results: DirectoryResult[],
  category: string | null,
  seen: string[],
): Page[] {
  const placed = new Set<string>();
  const pages: Page[] = [];
  let cursor = 0;
  while (placed.size < results.length) {
    const remaining = results.filter((r) => !placed.has(r.business.id));
    const sponsored = selectSponsored(remaining, category, seen);
    sponsored.forEach((s) => placed.add(s.business.id));
    const organic: DirectoryResult[] = [];
    while (
      organic.length < PAGE_SIZE - sponsored.length &&
      cursor < results.length
    ) {
      const r = results[cursor++];
      if (!placed.has(r.business.id)) {
        organic.push(r);
        placed.add(r.business.id);
      }
    }
    pages.push({ sponsored, organic });
    if (cursor >= results.length && placed.size >= results.length) break;
  }
  return pages;
}

const inBounds = (p: LatLng, b: MapBounds) =>
  p.lat >= b.south && p.lat <= b.north && p.lng >= b.west && p.lng <= b.east;

export function DirectoryExperience({
  all,
  base,
  serverNow,
  categoryNames,
}: {
  all: DirectoryBusiness[];
  base: DirectoryBase;
  serverNow: string;
  categoryNames: Record<string, string>;
}) {
  const t = useTranslations("businesses");
  const router = useRouter();
  const pathname = usePathname();
  const clientNow = useNow();
  const now = clientNow ?? new Date(serverNow);

  // ---- state that lives in the URL ----
  // Starts empty on the server and the first client render (the cached page
  // is the same for everyone), then follows the address bar.
  const [params, setParams] = useState(() => new URLSearchParams());
  useEffect(() => {
    const sync = () => setParams(new URLSearchParams(window.location.search));
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [pathname]);

  const view: ViewMode =
    (["grid", "list", "map"] as const).find((v) => v === params.get("view")) ??
    "grid";
  const districtParam = params.get("district");
  const district =
    base.district ?? (districtParam ? districtFromSlug(districtParam) : null);
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);

  const urlFilters: DirectoryFilters = useMemo(
    () => ({
      ...DEFAULT_FILTERS,
      q: params.get("q") ?? "",
      category: base.category,
      subcategory: base.subcategory,
      district,
      verified: params.get("verified") === "1",
      open: params.get("open") === "1",
      rating4: params.get("rating") === "4",
      delivery: params
        .getAll("delivery")
        .filter(
          (d): d is DeliveryFilter => d === "islandwide" || d === "district",
        ),
      distanceKm:
        DISTANCE_OPTIONS.find((d) => String(d) === params.get("distance")) ??
        null,
      instalment: params.get("instalment") === "1",
      authorisedBrand: params.get("brand"),
      sort: SORT_KEYS.find((s) => s === params.get("sort")) ?? "recommended",
    }),
    [params, base, district],
  );

  const commit = useCallback(
    (next: URLSearchParams, targetPath = pathname) => {
      const qs = next.toString();
      setParams(new URLSearchParams(qs));
      router.replace(qs ? `${targetPath}?${qs}` : targetPath, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  const change = useCallback(
    (patch: Partial<DirectoryFilters> & { view?: ViewMode; page?: number }) => {
      const next = new URLSearchParams(params.toString());
      const set = (key: string, value: string | null) =>
        value === null || value === ""
          ? next.delete(key)
          : next.set(key, value);
      if ("q" in patch) set("q", patch.q ?? "");
      if ("verified" in patch) set("verified", patch.verified ? "1" : null);
      if ("open" in patch) set("open", patch.open ? "1" : null);
      if ("rating4" in patch) set("rating", patch.rating4 ? "4" : null);
      if ("instalment" in patch)
        set("instalment", patch.instalment ? "1" : null);
      if ("authorisedBrand" in patch)
        set("brand", patch.authorisedBrand ?? null);
      if ("distanceKm" in patch)
        set("distance", patch.distanceKm ? String(patch.distanceKm) : null);
      if ("sort" in patch)
        set(
          "sort",
          patch.sort && patch.sort !== "recommended" ? patch.sort : null,
        );
      if ("delivery" in patch) {
        next.delete("delivery");
        (patch.delivery ?? []).forEach((d) => next.append("delivery", d));
      }
      if ("view" in patch)
        set("view", patch.view && patch.view !== "grid" ? patch.view : null);
      if (patch.page !== undefined)
        set("page", patch.page > 1 ? String(patch.page) : null);
      else next.delete("page");
      if (Object.keys(patch).some((k) => !["view", "page"].includes(k))) {
        trackBusinessEvent("filter_change", {
          keys: Object.keys(patch).join(","),
          category: base.category,
          district,
        });
      }
      commit(next);
    },
    [params, commit, base.category, district],
  );

  // ---- navigation between category / district pages ----
  const pathFor = (category: string | null, districtName: string | null) => {
    if (category)
      return districtName
        ? `/businesses/${category}/${districtSlug(districtName)}`
        : `/businesses/${category}`;
    return "/businesses";
  };
  const carry = () => {
    const next = new URLSearchParams(params.toString());
    next.delete("page");
    if (!base.category && districtParam) next.delete("district");
    return next;
  };
  const goDistrict = (name: string | null) => {
    const next = carry();
    if (base.category) {
      const qs = next.toString();
      router.push(`${pathFor(base.category, name)}${qs ? `?${qs}` : ""}`);
    } else {
      if (name) next.set("district", districtSlug(name));
      else next.delete("district");
      commit(next);
    }
  };

  // ---- location, area search, selection ----
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [area, setArea] = useState<MapBounds | null>(null);
  const [noLocationOnly, setNoLocationOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<"filters" | "ranking" | null>(null);

  const origin: LatLng | null =
    userLocation ?? (district ? DISTRICT_CENTRES[district] : null);
  const ctx: QueryContext = useMemo(
    () => ({ now, origin, userDistrict: district }),
    // `now` changes once a minute; that is how often "Open now" is rechecked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Math.floor(now.getTime() / 60000), origin, district],
  );

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {
        /* denied: distances stay measured from the district centre */
      },
    );
  };

  // What sponsors this visitor has already been shown this session. Read once
  // after mount and then frozen, so the slots never change under someone's
  // eyes while they scroll or come back.
  const [seenIds, setSeenIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      setSeenIds(JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? "[]"));
    } catch {
      /* sessionStorage unavailable */
    }
  }, []);

  // ---- the query ----
  // While a map area is searched, the district no longer limits the list.
  const effective: DirectoryFilters = useMemo(
    () => (area ? { ...urlFilters, district: null } : urlFilters),
    [area, urlFilters],
  );
  const query = useMemo(
    () => runDirectory(all, effective, ctx),
    [all, effective, ctx],
  );
  const baseQuery = useMemo(
    () =>
      runDirectory(
        all,
        {
          ...DEFAULT_FILTERS,
          category: base.category,
          subcategory: base.subcategory,
          district,
        },
        ctx,
      ),
    [all, base, district, ctx],
  );

  let results = query.results;
  if (area)
    results = results.filter(
      (r) => r.business.location && inBounds(r.business.location, area),
    );
  if (noLocationOnly) results = results.filter((r) => !r.business.location);

  const pages = useMemo(
    () => buildPages(results, urlFilters.category, seenIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, area, noLocationOnly, seenIds, urlFilters.category],
  );
  const pageCount = Math.max(1, pages.length);
  const current = Math.min(page, pageCount);
  const shown = pages[current - 1] ?? { sponsored: [], organic: [] };
  const pageItems = [...shown.sponsored, ...shown.organic];
  const sponsoredIds = useMemo(
    () => new Set(shown.sponsored.map((s) => s.business.id)),
    [shown.sponsored],
  );
  const offset = pages
    .slice(0, current - 1)
    .reduce((n, p) => n + p.sponsored.length + p.organic.length, 0);

  useEffect(() => {
    if (shown.sponsored.length === 0) return;
    try {
      const next = [
        ...new Set([...shown.sponsored.map((s) => s.business.id), ...seenIds]),
      ].slice(0, 30);
      sessionStorage.setItem(SEEN_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    // seenIds deliberately excluded: recording must not re-pick the slots.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown.sponsored]);

  const signature = JSON.stringify([effective, area, noLocationOnly]);
  useEffect(() => {
    trackBusinessEvent("directory_view", {
      category: base.category,
      district,
      view,
      page: current,
      sort: urlFilters.sort,
      filters: activeSummary(urlFilters),
    });
  }, [base.category, district, view, current, urlFilters]);
  useEffect(() => {
    setSelectedId(null);
    setArea(null);
    setNoLocationOnly(false);
    // Any change to the list itself starts clean.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(urlFilters), current]);

  useEffect(() => {
    if (!selectedId) return;
    document
      .getElementById(`biz-${selectedId}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  const submitSearch = (q: string) => {
    const count = runDirectory(all, { ...effective, q }, ctx).results.length;
    trackBusinessEvent("directory_search", {
      q: q.slice(0, 80),
      results: count,
      category: base.category,
    });
    change({ q });
  };

  // ---- labels ----
  const categoryName = base.category
    ? (categoryNames[base.category] ?? base.category)
    : null;
  const place = district ?? t("directory.sriLanka");
  const total = results.length;
  const districtsCount = new Set(
    baseQuery.results.map((r) => r.business.district),
  ).size;
  const verified = baseQuery.results.filter(
    (r) => r.business.verifiedLevel >= VERIFIED_MIN_LEVEL,
  ).length;
  const title = categoryName
    ? t("directory.titleCategory", { category: categoryName, place })
    : t("directory.titleAll", { place });
  const noLocationCount = pageItems.filter((r) => !r.business.location).length;

  const chips = [
    {
      id: null as string | null,
      label: t("directory.all"),
      count: query.totalForCategoryChips,
    },
    ...CHIP_ORDER.filter(
      (id) => (query.categoryCounts[id] ?? 0) > 0 || id === base.category,
    ).map((id) => ({
      id,
      label: categoryNames[id] ?? id,
      count: query.categoryCounts[id] ?? 0,
    })),
  ];

  const isMap = view === "map";
  const viewQs = view !== "grid" ? `?view=${view}` : "";

  // ---------------------------------------------------------------- render
  const searchRow = (compact: boolean) => (
    <div className="flex items-center gap-2">
      <SearchBox
        all={all}
        filters={urlFilters}
        ctx={ctx}
        value={urlFilters.q}
        onSubmit={submitSearch}
        seenIds={seenIds}
        compact={compact}
      />
      <label className="relative hidden shrink-0 sm:block">
        <span className="sr-only">{t("directory.location")}</span>
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
        <select
          value={district ?? ""}
          onChange={(e) => goDistrict(e.target.value || null)}
          className={`appearance-none rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] pl-9 pr-8 text-sm font-medium text-[var(--color-market-text)] ${compact ? "h-10" : "h-12"} w-[190px]`}
        >
          <option value="">{t("directory.allSriLanka")}</option>
          {SRI_LANKA_DISTRICTS.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );

  return (
    <div className="marketplace-page">
      {/* ---- header band: one line in map mode so the map gets the height ---- */}
      <div className="bg-gradient-to-b from-[#eaf1ff] to-[var(--color-market-background)] dark:from-[#0d1930]">
        <div
          className={`mx-auto px-4 sm:px-6 ${isMap ? "max-w-[1600px] py-2" : "max-w-7xl pb-3 pt-4"}`}
        >
          {!isMap && (
            <nav
              aria-label="Breadcrumb"
              className="mb-2 hidden flex-wrap items-center gap-1.5 text-xs text-[var(--color-market-text-muted)] sm:flex"
            >
              <Link href="/" className="hover:text-blue-600">
                {t("directory.home")}
              </Link>
              <span>/</span>
              <Link
                href="/businesses"
                className={
                  base.category
                    ? "hover:text-blue-600"
                    : "font-semibold text-[var(--color-market-text)]"
                }
              >
                {t("directory.businesses")}
              </Link>
              {categoryName && (
                <>
                  <span>/</span>
                  {district ? (
                    <Link
                      href={`/businesses/${base.category}`}
                      className="hover:text-blue-600"
                    >
                      {categoryName}
                    </Link>
                  ) : (
                    <span className="font-semibold text-[var(--color-market-text)]">
                      {categoryName}
                    </span>
                  )}
                </>
              )}
              {district && (
                <>
                  <span>/</span>
                  <span className="font-semibold text-[var(--color-market-text)]">
                    {district}
                  </span>
                </>
              )}
            </nav>
          )}

          {isMap ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="font-heading text-lg font-extrabold text-[var(--color-market-text)]">
                {title}
                <span className="ml-2 text-sm font-medium text-[var(--color-market-text-secondary)]">
                  {t("directory.statsShort", {
                    count: baseQuery.results.length,
                  })}
                </span>
              </h1>
              <div className="min-w-[280px] flex-1">{searchRow(true)}</div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-heading text-2xl font-extrabold text-[var(--color-market-text)] md:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-1 text-sm text-[var(--color-market-text-secondary)]">
                    {t("directory.stats", {
                      count: baseQuery.results.length,
                      verified,
                    })}
                    {!district &&
                      ` · ${t("directory.acrossDistricts", { count: districtsCount })}`}
                  </p>
                </div>
                <Link
                  href="/business/new"
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
                >
                  {t("directory.listYourBusiness")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-3">{searchRow(false)}</div>
            </>
          )}
        </div>
      </div>

      <div
        className={`mx-auto px-4 sm:px-6 ${isMap ? "max-w-[1600px]" : "max-w-7xl"}`}
      >
        {/* ---- category chips ---- */}
        <nav
          aria-label={t("directory.categories.label")}
          className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 py-3"
        >
          {chips.map((c) => {
            const active =
              c.id === base.category && !(c.id === null && base.category);
            return (
              <Link
                key={c.id ?? "all"}
                href={`${pathFor(c.id, c.id && district ? district : null)}${viewQs}`}
                aria-current={active ? "page" : undefined}
                className={`flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border text-sm font-semibold transition ${
                  c.id ? "pl-1.5 pr-3.5" : "px-4"
                } ${
                  active
                    ? "border-blue-600 bg-[#EEF4FF] text-blue-700 dark:bg-blue-950/40"
                    : "border-[var(--color-market-border)] bg-[var(--color-market-surface)] text-[var(--color-market-text-secondary)] hover:border-blue-300"
                }`}
              >
                {c.id && (
                  <span
                    className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${categoryAccent(c.id)}`}
                  >
                    <Image
                      src={categoryGlyphSrc(c.id)}
                      alt=""
                      width={32}
                      height={32}
                      className="h-4 w-4 object-contain"
                    />
                  </span>
                )}
                {c.label}
                <span
                  className={`text-xs ${active ? "text-blue-600/70" : "text-[var(--color-market-text-muted)]"}`}
                >
                  {c.count.toLocaleString("en-US")}
                </span>
              </Link>
            );
          })}
        </nav>

        <DirectoryFilterBar
          filters={urlFilters}
          onChange={change}
          view={view}
          onView={(v) => change({ view: v })}
          onAllFilters={() => setSheet("filters")}
          onRanking={() => setSheet("ranking")}
          hasUserLocation={!!userLocation}
          onUseLocation={useMyLocation}
        />

        {!isMap && (
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            <p className="text-[var(--color-market-text-secondary)]">
              {total === 0
                ? t("directory.none")
                : categoryName
                  ? t("directory.showingCategory", {
                      from: offset + 1,
                      to: offset + pageItems.length,
                      total,
                      category: categoryName.toLowerCase(),
                      place,
                    })
                  : t("directory.showingAll", {
                      from: offset + 1,
                      to: offset + pageItems.length,
                      total,
                      place,
                    })}
            </p>
            {shown.sponsored.length > 0 && (
              <button
                type="button"
                onClick={() => setSheet("ranking")}
                className="flex items-center gap-1.5 font-semibold text-blue-600"
              >
                <BarChart3 className="h-4 w-4" />
                {t("directory.sponsoredResults", {
                  count: shown.sponsored.length,
                })}
              </button>
            )}
          </div>
        )}

        {/* ---- results ---- */}
        {total === 0 ? (
          <EmptyState
            onClear={() => commit(new URLSearchParams())}
            t={t}
            hasQuery={!!urlFilters.q}
          />
        ) : isMap ? (
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-4 pb-6 lg:h-[calc(100vh-250px)] lg:min-h-[560px] lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
            <div className="order-2 flex min-h-0 flex-col lg:order-1">
              <div className="flex items-center justify-between gap-2 pb-2">
                <h2 className="text-base font-extrabold text-[var(--color-market-text)]">
                  {area
                    ? t("directory.inArea", { count: total })
                    : t("directory.inPlace", { count: total, place })}
                </h2>
                {area && (
                  <button
                    type="button"
                    onClick={() => setArea(null)}
                    className="flex items-center gap-1 rounded-full bg-[var(--color-market-blue-light)] px-2.5 py-1 text-xs font-semibold text-blue-700"
                  >
                    {t("directory.resetArea")}
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
                {pageItems.map((r, i) => (
                  <div key={r.business.id} id={`biz-${r.business.id}`}>
                    <DirectoryCard
                      result={r}
                      variant="side"
                      sponsored={sponsoredIds.has(r.business.id)}
                      now={clientNow}
                      source="directory-map"
                      position={offset + i + 1}
                      selected={
                        selectedId === r.business.id ||
                        hoveredId === r.business.id
                      }
                      onHover={setHoveredId}
                    />
                  </div>
                ))}
                {/* Pagination lives at the bottom of the list only. */}
                {pageCount > 1 && (
                  <div className="pt-2">
                    <Pagination
                      page={current}
                      totalPages={pageCount}
                      onChange={(p) => change({ page: p })}
                    />
                  </div>
                )}
                {noLocationCount > 0 && !noLocationOnly && (
                  <p className="pb-2 text-center text-xs text-[var(--color-market-text-muted)]">
                    {t("directory.noLocation", { count: noLocationCount })}{" "}
                    <button
                      type="button"
                      onClick={() => setNoLocationOnly(true)}
                      className="font-semibold text-blue-600"
                    >
                      {t("directory.showThem")}
                    </button>
                  </p>
                )}
                {noLocationOnly && (
                  <p className="pb-2 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => setNoLocationOnly(false)}
                      className="font-semibold text-blue-600"
                    >
                      {t("directory.backToMap")}
                    </button>
                  </p>
                )}
              </div>
            </div>
            <div className="order-1 h-[60vh] min-w-0 overflow-hidden rounded-2xl border border-[var(--color-market-border)] lg:order-2 lg:h-auto">
              <MapView
                items={pageItems}
                sponsoredIds={sponsoredIds}
                activeId={hoveredId}
                selectedId={selectedId}
                onSelect={setSelectedId}
                fitKey={`${signature}|${current}`}
                fallbackCentre={origin}
                onSearchArea={(b) => {
                  setArea(b);
                  setSelectedId(null);
                  trackBusinessEvent("map_search_area", {
                    category: base.category,
                    district,
                  });
                  change({ page: 1 });
                }}
                onLocate={setUserLocation}
                sponsoredLabel={t("directory.sponsored")}
                renderPopup={(r, close) => (
                  <div className="w-[360px] max-w-[85vw]">
                    <DirectoryCard
                      result={r}
                      variant="popup"
                      sponsored={sponsoredIds.has(r.business.id)}
                      now={clientNow}
                      source="map-popup"
                      position={0}
                      onClose={close}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        ) : (
          <>
            <div
              className={
                view === "grid"
                  ? "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "mt-4 flex flex-col gap-3"
              }
            >
              {pageItems.map((r, i) => (
                <DirectoryCard
                  key={r.business.id}
                  result={r}
                  variant={view === "grid" ? "grid" : "list"}
                  sponsored={sponsoredIds.has(r.business.id)}
                  now={clientNow}
                  source={`directory-${view}`}
                  position={offset + i + 1}
                />
              ))}
            </div>
            {pageCount > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  page={current}
                  totalPages={pageCount}
                  onChange={(p) => change({ page: p })}
                />
              </div>
            )}
            <GrowCta t={t} />
          </>
        )}
      </div>

      {sheet === "filters" && (
        <AllFiltersSheet
          filters={urlFilters}
          onChange={change}
          onClear={() =>
            commit(
              new URLSearchParams(
                params.get("view") ? { view: params.get("view")! } : {},
              ),
            )
          }
          onClose={() => setSheet(null)}
          resultCount={total}
          onRanking={() => setSheet("ranking")}
          brands={[...new Set(all.flatMap((b) => b.authorisedBrands))].sort()}
        />
      )}
      {sheet === "ranking" && (
        <HowRankingDialog onClose={() => setSheet(null)} />
      )}
    </div>
  );
}

function activeSummary(f: DirectoryFilters) {
  const parts: string[] = [];
  if (f.q) parts.push("q");
  if (f.verified) parts.push("verified");
  if (f.open) parts.push("open");
  if (f.rating4) parts.push("rating4");
  if (f.delivery.length) parts.push("delivery");
  if (f.distanceKm) parts.push(`distance${f.distanceKm}`);
  if (f.instalment) parts.push("instalment");
  if (f.authorisedBrand) parts.push("brand");
  return parts.join(",");
}

function EmptyState({
  onClear,
  t,
  hasQuery,
}: {
  onClear: () => void;
  t: ReturnType<typeof useTranslations>;
  hasQuery: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-20 text-center">
      <Search className="h-8 w-8 text-slate-300" />
      <p className="text-sm font-semibold text-[var(--color-market-text)]">
        {hasQuery ? t("directory.noResultsQuery") : t("directory.noResults")}
      </p>
      <p className="max-w-md text-xs text-[var(--color-market-text-muted)]">
        {t("directory.noResultsHint")}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="btn-outline mt-2 rounded-xl px-4 py-2 text-sm font-semibold"
      >
        {t("directory.clearAll")}
      </button>
    </div>
  );
}

function GrowCta({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="mt-10 grid gap-5 rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-5 md:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,1fr))] md:items-center md:p-6">
      <div>
        <h2 className="font-heading text-xl font-extrabold text-[var(--color-market-text)]">
          {t("directory.grow.title")}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-market-text-secondary)]">
          {t("directory.grow.text")}
        </p>
        <Link
          href="/business/new"
          className="btn-solid mt-3 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold"
        >
          {t("directory.grow.cta")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {(["found", "trust", "leads"] as const).map((k) => (
        <div key={k}>
          <p className="text-sm font-bold text-[var(--color-market-text)]">
            {t(`directory.grow.${k}.title`)}
          </p>
          <p className="mt-0.5 text-[13px] text-[var(--color-market-text-secondary)]">
            {t(`directory.grow.${k}.text`)}
          </p>
        </div>
      ))}
    </section>
  );
}
