import { categories } from "@/config/const/navLinks";
import { SRI_LANKA_DISTRICTS } from "@/config/const/sriLankaLocations";
import { cloudinaryUrl } from "@/lib/spotlight/image";
import type { CampaignFormValue } from "@/components/admin/spotlight/CampaignForm";

export const CATEGORY_OPTIONS = categories.map((c) => ({
  id: c.id,
  name: c.name,
}));
export const DISTRICT_OPTIONS = SRI_LANKA_DISTRICTS.map((d) => d.name);

const isCloudinaryId = (id: string) => !/^(https?:)?\//.test(id);

// A preview URL for a stored image (a Cloudinary id or a site path).
export function previewUrl(
  imageId: string | null | undefined,
  width = 1600,
): string {
  if (!imageId) return "";
  return isCloudinaryId(imageId)
    ? cloudinaryUrl(imageId, `w_${width},f_auto,q_auto`)
    : imageId;
}

type CampaignRow = {
  kind: "IMAGE" | "BUSINESS";
  status: CampaignFormValue["status"];
  businessProfile: { slug: string } | null;
  advertiser: string | null;
  tier: number;
  pinned: boolean;
  headline: string | null;
  subline: string | null;
  ctaLabel: string;
  destType: CampaignFormValue["destType"];
  destValue: string;
  imageId: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  focalX: number;
  focalY: number;
  altText: string | null;
  imageOnly: boolean;
  logoId: string | null;
  cropOverrides: unknown;
  targetCategory: string | null;
  targetDistrict: string | null;
};

export function toFormValue(c: CampaignRow): CampaignFormValue {
  const overrides = (c.cropOverrides ?? {}) as Partial<
    Record<"grid" | "wide" | "list", string>
  >;
  return {
    kind: c.kind,
    status: c.status,
    businessSlug: c.businessProfile?.slug ?? "",
    advertiser: c.advertiser ?? "",
    tier: c.tier,
    pinned: c.pinned,
    headline: c.headline ?? "",
    subline: c.subline ?? "",
    ctaLabel: c.ctaLabel,
    destType: c.destType,
    destValue: c.destValue,
    imageId: c.imageId ?? "",
    imageUrl: previewUrl(c.imageId),
    imageWidth: c.imageWidth,
    imageHeight: c.imageHeight,
    focalX: c.focalX,
    focalY: c.focalY,
    altText: c.altText ?? "",
    imageOnly: c.imageOnly,
    logoId: c.logoId ?? "",
    logoUrl: previewUrl(c.logoId, 160),
    overrides: Object.fromEntries(
      Object.entries(overrides)
        .filter(([, id]) => !!id)
        .map(([k, id]) => [
          k,
          { id: id as string, url: previewUrl(id as string) },
        ]),
    ),
    targetCategory: c.targetCategory ?? "",
    targetDistrict: c.targetDistrict ?? "",
    startsAt: "",
    endsAt: "",
  };
}
