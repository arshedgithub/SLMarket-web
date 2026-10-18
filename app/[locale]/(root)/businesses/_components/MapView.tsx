"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import * as maplibregl from "maplibre-gl";
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  Marker,
  Popup,
  StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";
import { Protocol } from "pmtiles";
import { layers, namedFlavor } from "@protomaps/basemaps";
import Supercluster from "supercluster";
import { LocateFixed, Minus, Plus, Search } from "lucide-react";
import { circlePolygon, type LatLng } from "@/lib/business/directory/geo";
import {
  DEFAULT_GLYPHS,
  DEFAULT_SPRITE,
  MAP_ATTRIBUTION,
  SRI_LANKA_BOUNDS,
  TILE_EXTENT,
  labelLanguage,
  pmtilesUrl,
} from "@/lib/business/directory/map";
import type { DirectoryResult } from "@/lib/business/directory/query";
import type { DirectoryBusiness } from "@/lib/business/directory/types";

export type MapBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

let protocolRegistered = false;
function registerProtocol() {
  if (protocolRegistered) return;
  // The engine's web worker is served from public/vendor (see
  // scripts/copy-maplibre-worker.mjs).
  maplibregl.setWorkerUrl("/vendor/maplibre/maplibre-gl-worker.mjs");
  const protocol = new Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  protocolRegistered = true;
}

function buildStyle(origin: string, locale: string): StyleSpecification {
  // A single quiet style in SLMarket's blues: no layer options.
  const flavor = {
    ...namedFlavor("light"),
    water: "#cfe0f5",
    earth: "#f4f6fb",
    park_a: "#e3efe4",
    park_b: "#e3efe4",
  };
  return {
    version: 8,
    glyphs: process.env.NEXT_PUBLIC_MAP_GLYPHS_URL ?? DEFAULT_GLYPHS,
    sprite: DEFAULT_SPRITE,
    sources: {
      protomaps: {
        type: "vector",
        url: `pmtiles://${pmtilesUrl(origin)}`,
        attribution: MAP_ATTRIBUTION,
      },
    },
    layers: layers("protomaps", flavor, { lang: labelLanguage(locale) }),
  } as StyleSpecification;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function pinElement(
  b: DirectoryBusiness,
  sponsored: boolean,
  approx: boolean,
  tagLabel: string,
) {
  const el = document.createElement("div");
  el.className = "slm-pin";
  el.dataset.id = b.id;
  el.dataset.approx = String(approx);
  el.dataset.active = "false";
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", b.name);
  el.tabIndex = 0;
  el.textContent = initials(b.name);
  if (sponsored) {
    const tag = document.createElement("span");
    tag.className = "slm-pin-tag";
    tag.textContent = tagLabel;
    el.appendChild(tag);
  }
  return el;
}

type Point = { id: string };

export function MapView({
  items,
  sponsoredIds,
  activeId,
  selectedId,
  onSelect,
  fitKey,
  fallbackCentre,
  onSearchArea,
  onLocate,
  renderPopup,
  sponsoredLabel,
}: {
  // Exactly the businesses on the current list page.
  items: DirectoryResult[];
  sponsoredIds: Set<string>;
  activeId: string | null; // hovered in the list
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  fitKey: string;
  fallbackCentre: LatLng | null;
  onSearchArea: (bounds: MapBounds) => void;
  onLocate: (at: LatLng) => void;
  renderPopup: (result: DirectoryResult, close: () => void) => ReactNode;
  sponsoredLabel: string;
}) {
  const t = useTranslations("businesses");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, { marker: Marker; el: HTMLElement }>>(
    new Map(),
  );
  const clusterMarkersRef = useRef<Marker[]>([]);
  const popupRef = useRef<Popup | null>(null);
  const popupElRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef<Supercluster<Point> | null>(null);
  const lastFitKey = useRef<string | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  // The latest renderMarkers, so map events never call a stale copy.
  const renderRef = useRef<() => void>(() => {});

  const [ready, setReady] = useState(false);
  const [moved, setMoved] = useState(false);
  const [popupHost, setPopupHost] = useState<HTMLDivElement | null>(null);

  const located = useMemo(
    () => items.filter((r) => r.business.location),
    [items],
  );
  const byId = useMemo(
    () => new Map(items.map((r) => [r.business.id, r])),
    [items],
  );

  // ---- create the map once ----
  useEffect(() => {
    if (!containerRef.current) return;
    registerProtocol();
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle(window.location.origin, locale),
      bounds: SRI_LANKA_BOUNDS,
      fitBoundsOptions: { padding: 10 },
      attributionControl: { compact: false },
      minZoom: 6.5,
      // No panning into the empty area outside the tile file.
      maxBounds: TILE_EXTENT,
    });
    map.addControl(
      new maplibregl.ScaleControl({ unit: "metric" }),
      "bottom-right",
    );

    map.on("load", () => {
      map.addSource("areas", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "areas-fill",
        type: "fill",
        source: "areas",
        paint: { "fill-color": "#1557d6", "fill-opacity": 0.08 },
      });
      map.addLayer({
        id: "areas-line",
        type: "line",
        source: "areas",
        paint: {
          "line-color": "#1557d6",
          "line-width": 1.5,
          "line-dasharray": [3, 2],
        },
      });
      setReady(true);
    });
    // "Search this area" only appears once the user has actually moved the map.
    map.on("movestart", (e: { originalEvent?: unknown }) => {
      if (e.originalEvent) setMoved(true);
    });
    // Re-cluster whenever the map settles (zoom, pan, and programmatic fits).
    map.on("moveend", () => renderRef.current());

    const host = document.createElement("div");
    popupElRef.current = host;
    setPopupHost(host);
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 30,
      maxWidth: "380px",
      className: "slm-popup",
    }).setDOMContent(host);

    mapRef.current = map;
    const markers = markersRef.current;
    return () => {
      markers.clear();
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
    // The map is created once; the language only affects labels at creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- supercluster index + area circles for this page's businesses ----
  useEffect(() => {
    if (!ready) return;
    const index = new Supercluster<Point>({ radius: 56, maxZoom: 15 });
    index.load(
      located.map((r) => ({
        type: "Feature" as const,
        properties: { id: r.business.id },
        geometry: {
          type: "Point" as const,
          coordinates: [r.business.location!.lng, r.business.location!.lat],
        },
      })),
    );
    indexRef.current = index;
    renderRef.current = renderMarkers;

    const source = mapRef.current?.getSource("areas") as
      | GeoJSONSource
      | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: located
        .filter((r) => r.business.serviceArea)
        .map((r) =>
          circlePolygon(r.business.location!, r.business.serviceArea!.radiusKm),
        ),
    });

    renderMarkers();

    // Fit only when the list itself changed (page, filters), never after
    // the visitor has been panning around.
    if (lastFitKey.current !== fitKey) {
      lastFitKey.current = fitKey;
      const map = mapRef.current;
      if (map) {
        if (located.length > 0) {
          const b = new maplibregl.LngLatBounds();
          located.forEach((r) =>
            b.extend([r.business.location!.lng, r.business.location!.lat]),
          );
          map.fitBounds(b, { padding: 70, maxZoom: 13, duration: 0 });
        } else if (fallbackCentre) {
          map.jumpTo({
            center: [fallbackCentre.lng, fallbackCentre.lat],
            zoom: 10,
          });
        } else {
          map.fitBounds(SRI_LANKA_BOUNDS, { padding: 10, duration: 0 });
        }
        setMoved(false);
      }
    }
    // Draw at the zoom the fit ended on.
    renderRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, located, fitKey]);

  function renderMarkers() {
    const map = mapRef.current;
    const index = indexRef.current;
    if (!map || !index) return;
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();
    clusterMarkersRef.current.forEach((m) => m.remove());
    clusterMarkersRef.current = [];

    const b = map.getBounds();
    const clusters = index.getClusters(
      [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
      Math.round(map.getZoom()),
    );
    for (const c of clusters) {
      const [lng, lat] = c.geometry.coordinates;
      const props = c.properties as {
        cluster?: boolean;
        cluster_id?: number;
        point_count?: number;
        id?: string;
      };
      if (props.cluster) {
        const el = document.createElement("div");
        el.className = "slm-cluster";
        el.textContent = String(props.point_count);
        el.setAttribute("role", "button");
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const zoom = index.getClusterExpansionZoom(props.cluster_id!);
          map.easeTo({ center: [lng, lat], zoom: Math.min(zoom, 16) });
        });
        clusterMarkersRef.current.push(
          new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map),
        );
      } else {
        const result = byId.get(props.id!);
        if (!result) continue;
        const b2 = result.business;
        const el = pinElement(
          b2,
          sponsoredIds.has(b2.id),
          !!b2.serviceArea,
          sponsoredLabel,
        );
        el.dataset.active = String(b2.id === selectedId || b2.id === activeId);
        const open = (e: Event) => {
          e.stopPropagation();
          onSelectRef.current(b2.id);
        };
        el.addEventListener("click", open);
        el.addEventListener("keydown", (e) => {
          if ((e as KeyboardEvent).key === "Enter") open(e);
        });
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map);
        markersRef.current.set(b2.id, { marker, el });
      }
    }
  }

  renderRef.current = renderMarkers;

  // Selected or hovered pins grow and get the blue border.
  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
      el.dataset.active = String(id === selectedId || id === activeId);
    });
  }, [selectedId, activeId, located]);

  // The popup follows the selection.
  useEffect(() => {
    const popup = popupRef.current;
    const map = mapRef.current;
    if (!popup || !map) return;
    const result = selectedId ? byId.get(selectedId) : undefined;
    if (result?.business.location) {
      const at = result.business.location;
      popup.setLngLat([at.lng, at.lat]).addTo(map);
      map.easeTo({ center: [at.lng, at.lat], duration: 350 });
    } else {
      popup.remove();
    }
  }, [selectedId, byId, ready]);

  const zoomBy = (delta: number) => {
    const map = mapRef.current;
    if (map) map.easeTo({ zoom: map.getZoom() + delta, duration: 200 });
  };

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const at = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapRef.current?.flyTo({ center: [at.lng, at.lat], zoom: 12 });
        onLocate(at);
      },
      () => {
        /* permission denied: the district centre stays the origin */
      },
    );
  };

  const searchArea = () => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds();
    onSearchArea({
      west: b.getWest(),
      south: b.getSouth(),
      east: b.getEast(),
      north: b.getNorth(),
    });
    setMoved(false);
  };

  const selected = selectedId ? byId.get(selectedId) : undefined;
  const control =
    "flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md transition hover:bg-slate-50 active:scale-95";

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f4f6fb]">
      <div
        ref={containerRef}
        className="h-full w-full"
        role="region"
        aria-label={t("directory.mapLabel")}
      />

      {moved && (
        <button
          type="button"
          onClick={searchArea}
          className="absolute left-1/2 top-4 z-10 flex h-11 -translate-x-1/2 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
        >
          <Search className="h-4 w-4" />
          {t("directory.searchArea")}
        </button>
      )}

      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md">
          <button
            type="button"
            aria-label={t("directory.zoomIn")}
            onClick={() => zoomBy(1)}
            className="flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
          </button>
          <span className="h-px bg-slate-200" />
          <button
            type="button"
            aria-label={t("directory.zoomOut")}
            onClick={() => zoomBy(-1)}
            className="flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-slate-50"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          aria-label={t("directory.locate")}
          onClick={locate}
          className={control}
        >
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>

      {popupHost &&
        selected &&
        createPortal(
          renderPopup(selected, () => onSelect(null)),
          popupHost,
        )}
    </div>
  );
}
