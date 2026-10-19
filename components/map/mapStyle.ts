import * as maplibregl from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { layers, namedFlavor } from "@protomaps/basemaps";
import {
  DEFAULT_GLYPHS,
  DEFAULT_SPRITE,
  MAP_ATTRIBUTION,
  labelLanguage,
  pmtilesUrl,
} from "@/lib/business/directory/map";

/*
 * Shared by every map on the site (directory, ad location): our own PMTiles
 * file, never a third-party tile server, and one quiet style.
 */

let protocolRegistered = false;
export function registerProtocol() {
  if (protocolRegistered) return;
  // The engine's web worker is served from public/vendor (see
  // scripts/copy-maplibre-worker.mjs).
  maplibregl.setWorkerUrl("/vendor/maplibre/maplibre-gl-worker.mjs");
  const protocol = new Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  protocolRegistered = true;
}

export function buildStyle(origin: string, locale: string): StyleSpecification {
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
