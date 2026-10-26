import { db } from "@/lib/db";
import { withTimeout } from "./dbGuard";
import { DEFAULT_HOURS } from "./responseTime";
import {
  itemsKindFor,
  toInternationalPhone,
  type Availability,
  type StorefrontBusiness,
  type StorefrontProduct,
} from "./storefront";
import { categories } from "@/config/const/navLinks";

/*
 * One entry point for the storefront page, from the BusinessProfile row
 * (there is no sample data; demo businesses are seeded into the database).
 * Fields the schema doesn't hold yet (reviews, followers, highlights,
 * hours, collections...) come back empty, which the page renders as its
 * "new business" state rather than inventing numbers.
 */

const STATUS_AVAILABILITY: Availability = "in-stock";

function pickFirstSentence(text: string | null, max = 110) {
  if (!text) return "";
  const first = text.split(/(?<=[.!?])\s/)[0] ?? text;
  return first.length > max ? `${first.slice(0, max - 1).trimEnd()}...` : first;
}

async function fromDatabase(slug: string): Promise<StorefrontBusiness | null> {
  const profile = await withTimeout(
    db.businessProfile.findUnique({
      where: { slug },
      include: {
        listings: {
          where: { status: "ACTIVE" },
          orderBy: [{ isBoosted: "desc" }, { createdAt: "desc" }],
          take: 200,
        },
        branches: true,
        offers: { where: { expiresAt: { gt: new Date() } } },
        verification: true,
      },
    }),
  );
  if (!profile || profile.status !== "ACTIVE") return null;

  const category = categories.find((c) => c.id === profile.categoryId);
  const now = Date.now();
  const products: StorefrontProduct[] = profile.listings.map((l) => {
    const attrs = (l.attributes ?? {}) as Record<string, unknown>;
    const condition = String(attrs.condition ?? "").toLowerCase();
    return {
      id: l.id,
      title: l.title,
      href: `/ad/${l.slug}`,
      image: l.images[0] ?? null,
      price: l.price != null ? Number(l.price) : 0,
      condition:
        condition === "new"
          ? "new"
          : condition === "reconditioned"
            ? "reconditioned"
            : condition
              ? "used"
              : undefined,
      availability: STATUS_AVAILABILITY,
      deliveryDays: l.islandwideDelivery ? [1, 3] : undefined,
      specs: [],
      category: l.subcategoryId,
      collections: [],
      addedDaysAgo: Math.floor((now - l.createdAt.getTime()) / 86_400_000),
      negotiable: l.negotiable,
      pinned: l.isBoosted,
    };
  });

  const phone = toInternationalPhone(profile.contactPhone);
  const bio = profile.bio ?? "";
  const verified = profile.isVerified;
  return {
    slug: profile.slug,
    name: profile.name,
    tagline: pickFirstSentence(bio),
    itemsKind: itemsKindFor(profile.categoryId, profile.businessType),
    categoryId: profile.categoryId,
    categoryName: category?.id ?? profile.categoryId,
    city: profile.city ?? profile.district ?? "",
    district: profile.district ?? "",
    cover: profile.bannerUrl,
    brandColor: "#1557d6",
    logo: profile.logoUrl,
    verified,
    verification: {
      phone: verified
        ? profile.createdAt.toISOString().slice(0, 10)
        : undefined,
      registration:
        verified && profile.verification?.businessRegUrl
          ? profile.verification.reviewedAt?.toISOString().slice(0, 10)
          : undefined,
    },
    sinceYear: profile.createdAt.getFullYear(),
    followers: 0,
    rating: { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] },
    response: { conversations: 0, medianMinutes: 0, replyRate: 0 },
    openingHours: DEFAULT_HOURS,
    hoursSet: false,
    hoursTable: [],
    phone,
    whatsapp: toInternationalPhone(
      profile.whatsappNumber ?? profile.contactPhone,
    ),
    primaryAction: "whatsapp",
    highlights: [],
    collections: [],
    products,
    offers: profile.offers.map((o) => ({
      id: o.id,
      title: o.title,
      description: "",
      code: o.code ?? undefined,
      badge: o.code ? "Offer" : "Deal",
      endsAt: o.expiresAt.toISOString(),
      image: null,
    })),
    brands: [],
    reviews: [],
    questions: [],
    about: {
      story: bio,
      team: [],
      languages: [],
      payments: [],
      instalmentProviders: [],
      deliveryAreas: "",
      deliveryFee: "",
      warrantyPolicy: "",
      returnsPolicy: "",
      faq: [],
      social: [],
    },
    branches: profile.branches.map((b, i) => ({
      id: b.id,
      label: b.label,
      address: b.city,
      district: b.district,
      main: i === 0,
    })),
    isNew: true,
    ...(profile.latitude != null && profile.longitude != null
      ? { location: { lat: profile.latitude, lng: profile.longitude } }
      : {}),
  };
}

export async function getStorefront(
  slug: string,
): Promise<StorefrontBusiness | null> {
  try {
    return await fromDatabase(slug);
  } catch {
    // Database unreachable: no page rather than a crash.
    return null;
  }
}
