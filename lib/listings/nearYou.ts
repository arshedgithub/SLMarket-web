import { DISTRICT_CENTRES, haversineKm } from "@/lib/business/directory/geo";

/*
 * Where "near you" means, for everyone (signed in or not), in this order:
 *   1. GPS        the visitor's position, only when they have allowed it
 *   2. chosen     the district they picked on the site (the /ads location)
 *   3. account    the district saved in their account
 *   4. ad         the ad's own district
 * GPS and the chosen place are kept as district names in cookies so the
 * server can use them when it renders recommendations.
 */

export const GPS_COOKIE = "slm_gps_district";
export const PLACE_COOKIE = "slm_place_district";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type OriginSource = "gps" | "chosen" | "account" | "ad";

export const isDistrict = (name: string | null | undefined): name is string =>
  !!name && Object.prototype.hasOwnProperty.call(DISTRICT_CENTRES, name);

// The district whose centre is closest to a point.
export function nearestDistrict(lat: number, lng: number): string {
  let best = "";
  let bestKm = Number.POSITIVE_INFINITY;
  for (const [name, centre] of Object.entries(DISTRICT_CENTRES)) {
    const km = haversineKm({ lat, lng }, centre);
    if (km < bestKm) {
      bestKm = km;
      best = name;
    }
  }
  return best;
}

export function resolveOrigin(input: {
  gps?: string | null;
  chosen?: string | null;
  account?: string | null;
  ad?: string | null;
}): { district: string | null; source: OriginSource | null } {
  const order: [OriginSource, string | null | undefined][] = [
    ["gps", input.gps],
    ["chosen", input.chosen],
    ["account", input.account],
    ["ad", input.ad],
  ];
  for (const [source, district] of order) {
    if (isDistrict(district)) return { district, source };
  }
  return { district: null, source: null };
}

function writeCookie(name: string, district: string) {
  document.cookie = `${name}=${encodeURIComponent(district)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax`;
}

// Browser only: remember the district picked on /ads.
export function rememberChosenDistrict(district: string | null) {
  if (isDistrict(district)) writeCookie(PLACE_COOKIE, district);
}

// Browser only: remember the GPS district. Returns true when it changed.
export function rememberGpsDistrict(district: string): boolean {
  const current = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${GPS_COOKIE}=`))
    ?.split("=")[1];
  if (current && decodeURIComponent(current) === district) return false;
  writeCookie(GPS_COOKIE, district);
  return true;
}
