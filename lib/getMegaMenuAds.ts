import { db } from "@/lib/db";
import { getOrSetCached } from "@/lib/redis";

const CACHE_TTL_SECONDS = 60;

export type MegaMenuAdSlide = {
  key: string;
  image: string;
  eyebrow: "boostedListing" | "premiumShop";
  title: string;
  description: string;
  href: string;
  // Matches a top-level id in config/const/navLinks.ts categories, so the
  // nav can build a "Browse {category}" second button with a real
  // translated label instead of a second hardcoded string here.
  categoryId: "gems" | "jewellery" | "precious-metals" | "services" | "sellers";
  categoryHref: string;
};

const LISTING_CATEGORY_MAP: Record<
  string,
  { categoryId: MegaMenuAdSlide["categoryId"]; categoryHref: string }
> = {
  GEM: { categoryId: "gems", categoryHref: "/gems" },
  JEWELLERY: { categoryId: "jewellery", categoryHref: "/jewellery" },
  PRECIOUS_METAL: {
    categoryId: "precious-metals",
    categoryHref: "/precious-metals",
  },
  SERVICE: { categoryId: "services", categoryHref: "/services" },
};

// Premium ad rail in the nav's "Browse Categories" modal: sellers who paid
// to boost a listing get first priority (that's what the boost was bought
// for), falling back to shops on a plan with homepageFeatureWeekly — the
// "priority reach" tier — when nobody currently has an active boost. Both
// queries return only what's needed to render a slide, kept small since
// this loads on every page via the nav.
export async function getMegaMenuAds(): Promise<MegaMenuAdSlide[]> {
  return getOrSetCached(
    "navigation:megaMenuAds:v2",
    CACHE_TTL_SECONDS,
    async () => {
      const boostedListings = await db.listing.findMany({
        where: {
          status: "ACTIVE",
          isBoosted: true,
          images: { isEmpty: false },
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          images: true,
          category: true,
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      });

      if (boostedListings.length > 0) {
        return boostedListings.map((listing) => {
          const mapped = LISTING_CATEGORY_MAP[listing.category] ?? {
            categoryId: "gems" as const,
            categoryHref: "/gems",
          };
          return {
            key: listing.id,
            image: listing.images[0]!,
            eyebrow: "boostedListing" as const,
            title: listing.title,
            description: listing.description,
            href: `/listings/${listing.slug}`,
            ...mapped,
          };
        });
      }

      const premiumShops = await db.user.findMany({
        where: {
          role: "SELLER",
          shopBannerUrl: { not: null },
          subscription: {
            status: "ACTIVE",
            plan: { homepageFeatureWeekly: true },
          },
        },
        select: {
          id: true,
          name: true,
          shopSlug: true,
          shopBannerUrl: true,
          shopBio: true,
        },
        take: 3,
      });

      return premiumShops.map((shop) => ({
        key: shop.id,
        image: shop.shopBannerUrl!,
        eyebrow: "premiumShop" as const,
        title: shop.name,
        description: shop.shopBio ?? "",
        href: `/shop/${shop.shopSlug}`,
        categoryId: "sellers" as const,
        categoryHref: "/sellers",
      }));
    },
  );
}
