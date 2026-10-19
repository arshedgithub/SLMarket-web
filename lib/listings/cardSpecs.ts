import type { AdCard } from "@/app/[locale]/(root)/ads/_components/data";

/*
 * The (at most) two specs a card shows, chosen per category so the key
 * facts always fit: electronics condition + storage, vehicles year +
 * mileage, property bedrooms + size, jobs type + work mode. Other
 * categories (and ads without structured details) use the seller's first
 * two highlights.
 */

const MAX_SPECS = 2;
const grouped = (n: string) =>
  Number(n.replace(/[^\d]/g, "")).toLocaleString("en-US");

function conditionLabel(ad: AdCard): string | undefined {
  if (ad.condition === "like-new") return "Like new";
  return ad.details?.condition;
}

export function cardSpecs(ad: AdCard): string[] {
  const d = ad.details ?? {};
  let specs: (string | undefined)[];
  switch (ad.categoryId) {
    case "electronics":
      specs = [
        conditionLabel(ad),
        d.storage?.replace(/\s*(SSD|HDD|eMMC)$/i, "") ?? d.ram,
      ];
      break;
    case "vehicles":
      specs = [d.year, d.mileage ? `${grouped(d.mileage)} km` : undefined];
      break;
    case "property":
      specs = [
        d.bedrooms
          ? `${d.bedrooms} ${d.bedrooms === "1" ? "bed" : "beds"}`
          : d.propertyType,
        d.floorArea
          ? `${grouped(d.floorArea)} sqft`
          : d.landSize
            ? `${d.landSize} perches`
            : undefined,
      ];
      break;
    case "jobs":
      specs = [d.employmentType, d.workMode];
      break;
    default:
      specs = [];
  }
  const chosen = specs.filter((s): s is string => !!s && s.trim().length > 0);
  if (chosen.length >= MAX_SPECS) return chosen.slice(0, MAX_SPECS);
  // Fill from the highlights, skipping the place and repeats.
  for (const a of ad.attrs) {
    if (chosen.length >= MAX_SPECS) break;
    const low = a.toLowerCase();
    if (low === ad.location.toLowerCase()) continue;
    if (chosen.some((c) => c.toLowerCase() === low)) continue;
    chosen.push(a);
  }
  return chosen;
}

// What kind of ad it is, where the photo doesn't say (bottom-left label).
export type ListingKind = "rent" | "sale" | "job" | "reserved";

export function listingKind(ad: AdCard): ListingKind | null {
  if (ad.reserved) return "reserved";
  if (ad.categoryId === "jobs") return "job";
  if (ad.categoryId === "property") {
    return ad.details?.listingType === "Rent out" ||
      ad.priceLabel.includes("/ month")
      ? "rent"
      : "sale";
  }
  return null;
}

// "Just listed": under 2 hours old.
export const JUST_LISTED_MS = 2 * 60 * 60 * 1000;
export const isJustListed = (ad: AdCard, now = Date.now()) =>
  now - Date.parse(ad.postedAt) < JUST_LISTED_MS;
