/*
 * Map configuration.
 *
 * The map library (MapLibre GL JS) is free. What can cost money is the
 * basemap tiles, so SLMarket serves its own: a Sri Lanka extract of the
 * Protomaps/OpenStreetMap data, one static PMTiles file that MapLibre reads
 * over ordinary range requests (no map server).
 *
 * Production
 *   1. Make the extract (about 36 MB to zoom 13; refresh every few months):
 *        pmtiles extract https://build.protomaps.com/<YYYYMMDD>.pmtiles \
 *          sri-lanka.pmtiles --bbox=79.4,5.8,82.1,9.95 --maxzoom=13
 *   2. Upload it to object storage behind a CDN (Cloudflare R2 has no
 *      download fees), e.g. https://tiles.slmarket.lk/sri-lanka.pmtiles
 *   3. Set NEXT_PUBLIC_PMTILES_URL to that address. Allow range requests
 *      (Range header) and CORS for the site's origin.
 *
 * Development: the same file in public/tiles/sri-lanka.pmtiles (gitignored),
 * which is the default below.
 *
 * Do NOT point this at tile.openstreetmap.org: its usage policy does not
 * allow heavy use by a commercial site.
 *
 * Labels in Sinhala or Tamil need glyph (font) files that include those
 * scripts. Until NEXT_PUBLIC_MAP_GLYPHS_URL points at a self-hosted set,
 * labels stay in English on every page language.
 *
 * Attribution is required and always shown: OpenStreetMap contributors and
 * Protomaps.
 */

export const DEFAULT_PMTILES_PATH = "/tiles/sri-lanka.pmtiles";
export const DEFAULT_GLYPHS =
  "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf";
export const DEFAULT_SPRITE =
  "https://protomaps.github.io/basemaps-assets/sprites/v4/light";

export const MAP_ATTRIBUTION =
  '<a href="https://protomaps.com" target="_blank" rel="noopener">Protomaps</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>';

// The island, with a margin.
export const SRI_LANKA_BOUNDS: [[number, number], [number, number]] = [
  [79.4, 5.8],
  [82.1, 9.95],
];

// How far the map may be panned: the tile file's extent, so there is never
// an empty grey area to scroll into.
export const TILE_EXTENT: [[number, number], [number, number]] = [
  [79.3, 5.7],
  [82.2, 10.05],
];

export function pmtilesUrl(origin: string) {
  const configured =
    process.env.NEXT_PUBLIC_PMTILES_URL ?? DEFAULT_PMTILES_PATH;
  return configured.startsWith("http") ? configured : `${origin}${configured}`;
}

export function labelLanguage(locale: string) {
  return locale === "si" || locale === "ta" ? locale : "en";
}
