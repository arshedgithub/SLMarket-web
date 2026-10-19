import {
  getFieldGroups,
  type ListingField,
} from "@/config/const/listingFields";

/*
 * Pure helpers that turn an ad's structured details (Listing.attributes,
 * keyed by config/const/listingFields.ts) into what the ad page shows.
 * Kept free of React and the database so they are easy to test.
 */

export type Details = Record<string, string>;

const isVisible = (field: ListingField, details: Details) =>
  !field.showWhen ||
  field.showWhen.equals.includes(details[field.showWhen.key] ?? "");

// "Intel Core i7-1165G7" -> "i7", "Apple M1" -> "M1", "512GB SSD" -> "512GB".
export function shortSpec(key: string, value: string): string {
  if (key === "processor") {
    const m = value.match(/\b(i[3579]|M[1-4](?: (?:Pro|Max))?|Ryzen \d)\b/i);
    return m ? m[1] : value;
  }
  if (key === "storage") return value.replace(/\s*(SSD|HDD|eMMC)$/i, "");
  return value;
}

const TITLE_SPECS: Record<string, string[]> = {
  Laptop: ["processor", "ram", "storage"],
  Phone: ["storage"],
  Tablet: ["storage"],
};

// The title, plus the key specs the seller left out of it:
// "Dell XPS 13 Laptop" -> "Dell XPS 13 Laptop (i7, 16GB, 512GB)".
export function titleWithSpecs(title: string, details: Details): string {
  const keys = TITLE_SPECS[details.deviceType ?? ""] ?? [];
  const lower = title.toLowerCase();
  const missing = keys
    .map((k) => (details[k] ? shortSpec(k, details[k]) : ""))
    .filter((v) => v && !lower.includes(v.toLowerCase()));
  return missing.length ? `${title} (${missing.join(", ")})` : title;
}

export type DetailRow = { key: string; label: string; value: string };

// The category's fields that have a value, in schema order, as label and
// display value. Warranty and its length read as one row.
export function keyDetailRows(
  categoryId: string,
  details: Details,
  words: {
    yes: string;
    no: string;
    warrantyMonths: (type: string, months: string) => string;
  },
): DetailRow[] {
  const rows: DetailRow[] = [];
  for (const group of getFieldGroups(categoryId)) {
    for (const field of group.fields) {
      const raw = details[field.key];
      if (raw === undefined || raw === "" || !isVisible(field, details))
        continue;
      if (field.key === "warrantyMonths") continue; // folded into warranty
      let value = raw;
      if (field.type === "toggle")
        value = raw === "true" ? words.yes : words.no;
      else if (
        field.key === "warranty" &&
        details.warrantyMonths &&
        raw !== "No warranty"
      ) {
        value = words.warrantyMonths(raw, details.warrantyMonths);
      } else if (field.unit) {
        const n = Number(raw);
        value =
          `${Number.isFinite(n) ? n.toLocaleString("en-US") : raw} ${field.unit}`.trim();
      }
      rows.push({ key: field.key, label: field.label, value });
    }
  }
  return rows;
}

// The quick-fact chips beside the price: condition, warranty, availability.
export function quickFacts(
  details: Details,
  warrantyMonths: (type: string, months: string) => string,
): string[] {
  const facts: string[] = [];
  if (details.condition) facts.push(details.condition);
  if (details.warranty && details.warranty !== "No warranty") {
    facts.push(
      details.warrantyMonths
        ? warrantyMonths(details.warranty, details.warrantyMonths)
        : details.warranty,
    );
  }
  if (
    details.availability &&
    ["In stock", "Few left", "Pre-order"].includes(details.availability)
  ) {
    facts.push(details.availability);
  }
  return facts;
}

// schema.org itemCondition for the Offer, matching the condition field.
export function schemaCondition(
  condition: string | undefined,
): string | undefined {
  if (!condition) return undefined;
  if (condition === "Brand new") return "https://schema.org/NewCondition";
  if (condition === "Refurbished" || condition === "Reconditioned")
    return "https://schema.org/RefurbishedCondition";
  return "https://schema.org/UsedCondition";
}
