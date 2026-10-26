import { cache } from "react";
import { db } from "@/lib/db";
import { categories } from "@/config/const/navLinks";
import { withTimeout } from "../dbGuard";
import { DEFAULT_HOURS } from "../responseTime";
import { itemsKindFor } from "../storefront";
import type { BusinessHighlight } from "../highlights";
import { intlPhone } from "@/lib/phone";
import { DISTRICT_CENTRES } from "./geo";
import type { DirectoryBusiness } from "./types";

/*
 * The Businesses directory, from the database: every active business
 * profile with its live ads. Fields the schema does not hold yet stay
 * honest rather than invented: no reviews (rating 0 of 0), no measured
 * response, opening hours "not set", no paid sponsorship.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const TIMEOUT_MS = 5000;

const TYPE_LABEL: Record<string, string> = {
  STORE: "Store",
  DEALER: "Dealer",
  AGENCY: "Agency",
  INSTITUTE: "Institute",
  SERVICE_PROVIDER: "Service provider",
  FARM: "Farm",
  OTHER: "Business",
};

export type DirectoryRow = Awaited<ReturnType<typeof queryDirectory>>[number];

function queryDirectory() {
  return db.businessProfile.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      slug: true,
      name: true,
      categoryId: true,
      businessType: true,
      bio: true,
      logoUrl: true,
      bannerUrl: true,
      city: true,
      district: true,
      latitude: true,
      longitude: true,
      contactPhone: true,
      whatsappNumber: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      listings: {
        where: { status: { in: ["ACTIVE", "RESERVED"] } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          subcategoryId: true,
          attributes: true,
          islandwideDelivery: true,
          deliveryAvailable: true,
          district: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

export function toDirectoryBusiness(
  row: DirectoryRow,
  now = Date.now(),
): DirectoryBusiness {
  const days = (d: Date) =>
    Math.max(0, Math.floor((now - d.getTime()) / DAY_MS));
  const listings = row.listings;
  const category = categories.find((c) => c.id === row.categoryId);
  const district = row.district ?? row.city ?? "";
  const lastActive = [
    row.updatedAt,
    ...listings.map((l) => l.updatedAt),
  ].reduce((a, b) => (b > a ? b : a));
  const islandwide = listings.some((l) => l.islandwideDelivery);
  const highlights: BusinessHighlight[] =
    islandwide || listings.some((l) => l.deliveryAvailable) ? ["delivery"] : [];
  const brands = [
    ...new Set(
      listings
        .map((l) => (l.attributes as Record<string, unknown> | null)?.brand)
        .filter((b): b is string => typeof b === "string" && b.length > 0),
    ),
  ];
  // How complete the profile is (a ranking signal): description, logo,
  // banner, shop location, WhatsApp, and at least 3 live ads.
  const checks = [
    !!row.bio,
    !!row.logoUrl,
    !!row.bannerUrl,
    row.latitude != null,
    !!row.whatsappNumber,
    listings.length >= 3,
  ];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.bio ? row.bio.split(/(?<=[.!?])\s/)[0].slice(0, 110) : "",
    itemsKind: itemsKindFor(row.categoryId, row.businessType),
    categoryId: row.categoryId,
    secondaryCategoryIds: [],
    subcategoryIds: [...new Set(listings.map((l) => l.subcategoryId))],
    typeLabel:
      `${category?.name ?? ""} ${TYPE_LABEL[row.businessType ?? "OTHER"] ?? "Business"}`.trim(),
    district,
    city: row.city ?? district,
    location:
      row.latitude != null && row.longitude != null
        ? { lat: row.latitude, lng: row.longitude }
        : null,
    ...(row.latitude == null && DISTRICT_CENTRES[district]
      ? { serviceArea: { radiusKm: 5 } }
      : {}),
    verifiedLevel: row.isVerified ? 2 : 1,
    rating: { average: 0, count: 0 },
    response: { conversations: 0, medianMinutes: 0, replyRate: 0 },
    openingHours: DEFAULT_HOURS,
    hoursSet: false,
    highlights,
    authorisedBrands: [],
    otherBrands: brands,
    delivery: { islandwide, districts: [] },
    instalmentProviders: [],
    itemCount: listings.length,
    items: listings.slice(0, 6).map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price === null ? 0 : Number(l.price),
      image: l.images[0] ?? "",
      category: l.subcategoryId,
      brand: (l.attributes as Record<string, unknown> | null)?.brand as
        | string
        | undefined,
      addedDaysAgo: days(l.createdAt),
    })),
    logo: row.logoUrl,
    brandColor: "#1557d6",
    cover: row.bannerUrl,
    phone: intlPhone(row.contactPhone) ?? "",
    whatsapp: intlPhone(row.whatsappNumber ?? row.contactPhone) ?? "",
    createdDaysAgo: days(row.createdAt),
    lastActiveDaysAgo: days(lastActive),
    completeness: checks.filter(Boolean).length / checks.length,
    published: true,
    suspended: false,
  };
}

// Read once per request; an unreachable database is an empty directory.
export const getDirectory = cache(async (): Promise<DirectoryBusiness[]> => {
  try {
    const rows = await withTimeout(queryDirectory(), TIMEOUT_MS);
    return rows.map((r) => toDirectoryBusiness(r));
  } catch {
    return [];
  }
});
