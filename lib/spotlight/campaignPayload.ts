import { z } from "zod";
import { categories } from "@/config/const/navLinks";
import { SRI_LANKA_DISTRICTS } from "@/config/const/sriLankaLocations";
import { resolveDestination } from "./destination";

/*
 * What an admin may save for a spotlight campaign (create and edit share
 * it). The rules follow the slot design: a headline of at most 6 words,
 * live text instead of text baked into the image, alt text on every
 * image, a destination that resolves, and dates in order.
 */

export const MIN_MASTER_WIDTH = 2000;
export const HEADLINE_MAX_WORDS = 6;

const DISTRICTS = new Set(SRI_LANKA_DISTRICTS.map((d) => d.name));
const CATEGORY_IDS = new Set(categories.map((c) => c.id));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const date = z
  .string()
  .optional()
  .nullable()
  .transform((v, ctx) => {
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: "custom", message: "Enter a valid date." });
      return z.NEVER;
    }
    return d;
  });

export const campaignSchema = z
  .object({
    kind: z.enum(["IMAGE", "BUSINESS"]),
    status: z.enum(["DRAFT", "SCHEDULED", "LIVE", "PAUSED"]),
    businessSlug: optionalText(140),
    advertiser: optionalText(80),
    tier: z.number().int().min(1).max(4),
    pinned: z.boolean(),
    headline: optionalText(60),
    subline: optionalText(60),
    ctaLabel: z.string().trim().max(24),
    destType: z.enum(["STORE", "LIST", "AD", "EXTERNAL"]),
    destValue: z
      .string()
      .trim()
      .min(1, "Choose where the slot links to.")
      .max(500),
    imageId: optionalText(300),
    imageWidth: z.number().int().positive().optional().nullable(),
    imageHeight: z.number().int().positive().optional().nullable(),
    focalX: z.number().min(0).max(1),
    focalY: z.number().min(0).max(1),
    altText: optionalText(160),
    imageOnly: z.boolean(),
    logoId: optionalText(300),
    cropOverrides: z
      .object({
        grid: z.string().optional(),
        wide: z.string().optional(),
        list: z.string().optional(),
      })
      .optional()
      .nullable(),
    targetCategory: optionalText(60),
    targetDistrict: optionalText(60),
    startsAt: date,
    endsAt: date,
  })
  .superRefine((c, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    if (c.kind === "BUSINESS" && !c.businessSlug)
      issue("businessSlug", "Choose the business this campaign promotes.");
    if (c.kind === "IMAGE") {
      if (!c.imageId) issue("imageId", "Upload the campaign image.");
      if (!c.altText)
        issue("altText", "Describe the image for screen readers (alt text).");
      if (c.imageWidth && c.imageWidth < MIN_MASTER_WIDTH) {
        issue(
          "imageId",
          `The image must be at least ${MIN_MASTER_WIDTH}px wide.`,
        );
      }
      if (!c.imageOnly && !c.headline)
        issue(
          "headline",
          "Add a headline, or mark the image as finished artwork.",
        );
    }
    if (c.headline && c.headline.split(/\s+/).length > HEADLINE_MAX_WORDS) {
      issue(
        "headline",
        `Keep the headline to ${HEADLINE_MAX_WORDS} words or fewer.`,
      );
    }
    if (!c.imageOnly && !c.ctaLabel) issue("ctaLabel", "Add a button label.");
    try {
      resolveDestination(c.destType, c.destValue);
    } catch (e) {
      issue("destValue", (e as Error).message);
    }
    if (c.targetCategory && !CATEGORY_IDS.has(c.targetCategory))
      issue("targetCategory", "Choose a category from the list.");
    if (c.targetDistrict && !DISTRICTS.has(c.targetDistrict))
      issue("targetDistrict", "Choose a district from the list.");
    if (c.status === "SCHEDULED" && !c.startsAt)
      issue("startsAt", "A scheduled campaign needs a start date.");
    if (c.startsAt && c.endsAt && c.endsAt <= c.startsAt)
      issue("endsAt", "The end date must be after the start date.");
  });

export type CampaignInput = z.input<typeof campaignSchema>;
export type CampaignData = z.output<typeof campaignSchema>;
