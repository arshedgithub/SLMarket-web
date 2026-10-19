import { slugify } from "../slug";

export type LatLng = { lat: number; lng: number };

/*
 * District centre points, used for "Distance" when the visitor hasn't shared
 * their location, and for businesses without a pin. Approximate centres of the
 * district towns; replace with the boundaries table from OpenStreetMap or
 * government data once it lives in the database (PostGIS).
 */
export const DISTRICT_CENTRES: Record<string, LatLng> = {
  Colombo: { lat: 6.9271, lng: 79.8612 },
  Gampaha: { lat: 7.0917, lng: 79.9999 },
  Kalutara: { lat: 6.5854, lng: 79.9607 },
  Kandy: { lat: 7.2906, lng: 80.6337 },
  Matale: { lat: 7.4675, lng: 80.6234 },
  "Nuwara Eliya": { lat: 6.9497, lng: 80.7891 },
  Galle: { lat: 6.0535, lng: 80.221 },
  Matara: { lat: 5.9549, lng: 80.555 },
  Hambantota: { lat: 6.1246, lng: 81.1185 },
  Jaffna: { lat: 9.6615, lng: 80.0255 },
  Kilinochchi: { lat: 9.3803, lng: 80.377 },
  Mannar: { lat: 8.981, lng: 79.9044 },
  Vavuniya: { lat: 8.7514, lng: 80.4971 },
  Mullaitivu: { lat: 9.2671, lng: 80.8142 },
  Batticaloa: { lat: 7.731, lng: 81.6747 },
  Ampara: { lat: 7.2975, lng: 81.682 },
  Trincomalee: { lat: 8.5874, lng: 81.2152 },
  Kurunegala: { lat: 7.4863, lng: 80.3647 },
  Puttalam: { lat: 8.0362, lng: 79.8283 },
  Anuradhapura: { lat: 8.3114, lng: 80.4037 },
  Polonnaruwa: { lat: 7.9403, lng: 81.0188 },
  Badulla: { lat: 6.9934, lng: 81.055 },
  Monaragala: { lat: 6.8728, lng: 81.3507 },
  Ratnapura: { lat: 6.7056, lng: 80.3847 },
  Kegalle: { lat: 7.2513, lng: 80.3464 },
};

export const districtSlug = (name: string) => slugify(name);

export function districtFromSlug(slug: string): string | null {
  return (
    Object.keys(DISTRICT_CENTRES).find((d) => districtSlug(d) === slug) ?? null
  );
}

const EARTH_KM = 6371;
const rad = (deg: number) => (deg * Math.PI) / 180;

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

// A GeoJSON polygon approximating a circle (for the approximate-area circle).
export function circlePolygon(centre: LatLng, radiusKm: number, steps = 48) {
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dLat = (radiusKm / EARTH_KM) * Math.sin(angle);
    const dLng =
      ((radiusKm / EARTH_KM) * Math.cos(angle)) / Math.cos(rad(centre.lat));
    coords.push([
      centre.lng + (dLng * 180) / Math.PI,
      centre.lat + (dLat * 180) / Math.PI,
    ]);
  }
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Polygon" as const, coordinates: [coords] },
  };
}
