"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { buildStyle, registerProtocol } from "@/components/map/mapStyle";
import { circlePolygon, type LatLng } from "@/lib/business/directory/geo";

/*
 * A small, still map of where the ad is:
 *   pin     a business with a shop location: its exact pin
 *   area    everyone else (always private sellers): an approximate circle,
 *           never a pin, so a private seller is never pinpointed
 */
export function AdLocationMap({
  centre,
  radiusKm,
  pin,
  label,
}: {
  centre: LatLng;
  radiusKm: number;
  pin?: LatLng;
  label: string;
}) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement | null>(null);
  const pinLat = pin?.lat;
  const pinLng = pin?.lng;

  useEffect(() => {
    if (!ref.current) return;
    registerProtocol();
    const exact = pinLat !== undefined && pinLng !== undefined;
    const map = new maplibregl.Map({
      container: ref.current,
      style: buildStyle(window.location.origin, locale),
      center: exact ? [pinLng, pinLat] : [centre.lng, centre.lat],
      zoom: exact ? 14 : 10.5,
      interactive: false,
      attributionControl: { compact: true },
    });

    if (exact) {
      const el = document.createElement("div");
      el.className =
        "h-5 w-5 rounded-full border-[3px] border-white bg-[#1557d6] shadow-[0_2px_8px_rgba(0,0,0,0.35)]";
      new maplibregl.Marker({ element: el })
        .setLngLat([pinLng, pinLat])
        .addTo(map);
    } else {
      map.on("load", () => {
        const area = circlePolygon(centre, radiusKm);
        map.addSource("area", { type: "geojson", data: area });
        map.addLayer({
          id: "area-fill",
          type: "fill",
          source: "area",
          paint: { "fill-color": "#1557d6", "fill-opacity": 0.14 },
        });
        map.addLayer({
          id: "area-line",
          type: "line",
          source: "area",
          paint: {
            "line-color": "#1557d6",
            "line-width": 2,
            "line-opacity": 0.7,
          },
        });
        const bounds = new maplibregl.LngLatBounds();
        for (const [lng, lat] of area.geometry.coordinates[0])
          bounds.extend([lng, lat]);
        map.fitBounds(bounds, { padding: 24, duration: 0 });
      });
    }
    return () => map.remove();
  }, [centre, radiusKm, pinLat, pinLng, locale]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className="h-56 w-full overflow-hidden rounded-xl border border-[var(--color-market-border)] bg-[#f4f6fb]"
    />
  );
}
