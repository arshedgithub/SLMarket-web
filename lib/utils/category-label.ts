import { categories } from "@/config/const/navLinks";

// Looks up a category id (e.g. "vehicles") against the real taxonomy for
// its display name ("Vehicles"). Falls back to the raw id for anything
// unrecognised rather than showing nothing.
export function categoryLabel(categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.name ?? categoryId;
}
