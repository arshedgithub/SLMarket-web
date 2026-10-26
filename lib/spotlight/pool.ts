import { db } from "@/lib/db";
import { withTimeout } from "@/lib/business/dbGuard";
import { categories } from "@/config/const/navLinks";
import { intlPhone } from "@/lib/phone";
import { colomboDay, feedWhere } from "@/lib/listings/feed";
import { resolveDestination, type DestinationType } from "./destination";
import { spotlightImage, squareUrl, type CropOverrides } from "./image";
import type { SpotlightBusiness, SpotlightCandidate } from "./types";

/*
 * Everything that may fill a spotlight slot right now:
 *   - admin campaigns that are live (or scheduled and inside their dates)
 *   - premium-tier businesses (premium 1, top rated 2, verified 3) with at
 *     least one live ad, unless they already run a business campaign
 * Ranking happens in rank.ts.
 */

const BUSINESS_TIER = { PREMIUM: 1, TOP_RATED: 2, VERIFIED: 3 } as const;
const THUMBS = 3;
const TIMEOUT_MS = 4000;

const businessSelect = {
  id: true,
  slug: true,
  name: true,
  bio: true,
  categoryId: true,
  city: true,
  district: true,
  isVerified: true,
  tier: true,
  bannerUrl: true,
  logoUrl: true,
  contactPhone: true,
  whatsappNumber: true,
  listings: {
    where: feedWhere(),
    orderBy: { createdAt: "desc" as const },
    select: { slug: true, title: true, images: true },
  },
} as const;

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  categoryId: string;
  city: string | null;
  district: string | null;
  isVerified: boolean;
  tier: string;
  bannerUrl: string | null;
  logoUrl: string | null;
  contactPhone: string | null;
  whatsappNumber: string | null;
  listings: { slug: string; title: string; images: string[] }[];
};

function toBusiness(b: BusinessRow): SpotlightBusiness {
  return {
    name: b.name,
    slug: b.slug,
    tagline: b.bio ? b.bio.split(/(?<=[.!?])\s/)[0].slice(0, 110) : "",
    verified: b.isVerified,
    premium: b.tier === "PREMIUM",
    category:
      categories.find((c) => c.id === b.categoryId)?.name ?? b.categoryId,
    city: b.city ?? b.district ?? "",
    cover: b.bannerUrl,
    logo: b.logoUrl ? squareUrl(b.logoUrl, 128) : null,
    adsCount: b.listings.length,
    phone: intlPhone(b.whatsappNumber ?? b.contactPhone),
    thumbs: b.listings
      .filter((l) => l.images[0])
      .slice(0, THUMBS)
      .map((l) => ({
        slug: l.slug,
        title: l.title,
        image: squareUrl(l.images[0], 160),
      })),
  };
}

export async function getSpotlightPool(
  now = new Date(),
): Promise<SpotlightCandidate[]> {
  const [campaigns, businesses, stats] = await withTimeout(
    Promise.all([
      db.spotlightCampaign.findMany({
        where: {
          status: { in: ["LIVE", "SCHEDULED"] },
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          AND: [{ OR: [{ endsAt: null }, { endsAt: { gt: now } }] }],
        },
        include: {
          businessProfile: { select: { ...businessSelect, status: true } },
        },
      }),
      db.businessProfile.findMany({
        where: {
          status: "ACTIVE",
          tier: { in: ["PREMIUM", "TOP_RATED", "VERIFIED"] },
        },
        select: businessSelect,
      }),
      db.spotlightStatDaily.findMany({
        where: { day: new Date(`${colomboDay(now.getTime())}T00:00:00Z`) },
        select: { spotId: true, impressions: true },
      }),
    ]),
    TIMEOUT_MS,
  );
  const impressions = new Map(stats.map((s) => [s.spotId, s.impressions]));
  const out: SpotlightCandidate[] = [];
  const campaignBusinesses = new Set<string>();

  for (const c of campaigns) {
    const b = c.businessProfile;
    if (
      c.kind === "BUSINESS" &&
      (!b || b.status !== "ACTIVE" || b.listings.length === 0)
    )
      continue;
    let dest;
    try {
      dest = resolveDestination(c.destType as DestinationType, c.destValue);
    } catch {
      continue; // a broken destination never reaches a page
    }
    if (c.kind === "BUSINESS" && b) campaignBusinesses.add(b.id);
    const image = c.imageId
      ? spotlightImage(
          c.imageId,
          { x: c.focalX, y: c.focalY },
          { width: c.imageWidth, height: c.imageHeight },
          (c.cropOverrides ?? {}) as CropOverrides,
        )
      : null;
    if (c.kind === "IMAGE" && !image) continue;
    const id = `c:${c.id}`;
    out.push({
      id,
      kind: c.kind === "BUSINESS" ? "business" : "image",
      advertiser: c.advertiser ?? c.businessProfileId ?? id,
      tier: c.tier,
      pinned: c.pinned,
      headline: c.headline,
      subline: c.subline,
      ctaLabel: c.ctaLabel,
      ...dest,
      image,
      altText: c.altText,
      imageOnly: c.imageOnly,
      logo: c.logoId ? squareUrl(c.logoId, 128) : null,
      business: c.kind === "BUSINESS" && b ? toBusiness(b) : null,
      impressionsToday: impressions.get(id) ?? 0,
      targetCategory: c.targetCategory,
      targetDistrict: c.targetDistrict,
      categoryId: b?.categoryId ?? null,
      district: b?.district ?? null,
    });
  }

  for (const b of businesses) {
    if (campaignBusinesses.has(b.id) || b.listings.length === 0) continue;
    const id = `b:${b.id}`;
    out.push({
      id,
      kind: "business",
      advertiser: b.id,
      tier: BUSINESS_TIER[b.tier as keyof typeof BUSINESS_TIER] ?? 4,
      pinned: false,
      headline: null,
      subline: null,
      ctaLabel: "",
      href: `/business/${b.slug}`,
      external: false,
      domain: null,
      image: null,
      altText: null,
      imageOnly: false,
      logo: null,
      business: toBusiness(b),
      impressionsToday: impressions.get(id) ?? 0,
      targetCategory: null,
      targetDistrict: null,
      categoryId: b.categoryId,
      district: b.district,
    });
  }
  return out;
}
