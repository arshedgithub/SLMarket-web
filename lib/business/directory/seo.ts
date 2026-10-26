import { categories } from "@/config/const/navLinks";
import { districtSlug, DISTRICT_CENTRES } from "./geo";
import { isListed, runDirectory } from "./query";
import { getDirectory } from "./fromDatabase";
import { DEFAULT_FILTERS } from "./types";

// Directory categories, in the order the chips show them.
export const DIRECTORY_CATEGORY_ORDER = [
  "electronics",
  "vehicles",
  "property",
  "services",
  "home-garden",
  "fashion",
  "food",
  "agriculture",
  "education",
] as const;

// A category-and-district page is indexed only with at least this many
// businesses: dozens of near-empty "AC repair in Mullaitivu" pages would
// drag the whole site down as thin content.
export const DISTRICT_INDEX_MIN_BUSINESSES = 3;

const KNOWN = new Set(categories.map((c) => c.id));

// Every directory URL that is worth putting in the sitemap: the directory,
// each category with something in it, each subcategory with something in it,
// and each category-and-district page that meets the threshold.
export async function directorySitemapPaths(): Promise<string[]> {
  const all = (await getDirectory()).filter(isListed);
  const ctx = { now: new Date(), origin: null, userDistrict: null };
  const count = (filters: Partial<typeof DEFAULT_FILTERS>) =>
    runDirectory(all, { ...DEFAULT_FILTERS, ...filters }, ctx).results.length;

  const paths = ["/businesses"];
  for (const id of DIRECTORY_CATEGORY_ORDER) {
    if (!KNOWN.has(id) || count({ category: id }) === 0) continue;
    paths.push(`/businesses/${id}`);
    const cat = categories.find((c) => c.id === id)!;
    for (const sub of cat.subcategories) {
      if (count({ category: id, subcategory: sub.id }) > 0)
        paths.push(`/businesses/${id}/${sub.id}`);
    }
    for (const district of Object.keys(DISTRICT_CENTRES)) {
      if (count({ category: id, district }) >= DISTRICT_INDEX_MIN_BUSINESSES) {
        paths.push(`/businesses/${id}/${districtSlug(district)}`);
      }
    }
  }
  return paths;
}
