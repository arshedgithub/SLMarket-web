import { z } from "zod";

export const upgradeSchema = z.object({
  planId: z.string().min(1),
  couponCode: z.string().optional(),
  cycle: z.enum(["MONTHLY", "ANNUAL"]).default("MONTHLY"),
  // Which of the owner's business pages; optional when they have only one.
  businessProfileId: z.string().min(1).optional(),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1),
  planId: z.string().min(1),
  cycle: z.enum(["MONTHLY", "ANNUAL"]).default("MONTHLY"),
});

const couponBaseSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(40)
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Code can only contain letters, numbers, hyphens and underscores",
    )
    .transform((v) => v.toUpperCase()),
  description: z.string().max(255).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_USD", "FREE_MONTHS"]),
  discountValue: z.number().positive(),
  applicablePlanIds: z.array(z.string()).default([]),
  billingCycle: z.enum(["MONTHLY", "ANNUAL"]).nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  maxUsesPerUser: z.number().int().positive().default(1),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  isActive: z.boolean().default(true),
});

const refinePercentage = <
  T extends { discountType?: string; discountValue?: number },
>(
  data: T,
) =>
  data.discountType !== "PERCENTAGE" ||
  data.discountValue === undefined ||
  data.discountValue <= 100;

export const couponCreateSchema = couponBaseSchema.refine(refinePercentage, {
  message: "Percentage discount cannot exceed 100",
  path: ["discountValue"],
});

export const couponUpdateSchema = couponBaseSchema
  .partial()
  .refine(refinePercentage, {
    message: "Percentage discount cannot exceed 100",
    path: ["discountValue"],
  });

export const boostSchema = z.object({
  boostType: z.enum([
    "TOP_SEARCH_1D",
    "TOP_SEARCH_3D",
    "TOP_SEARCH_7D",
    "CATEGORY_BANNER",
  ]),
  useFreeBoost: z.boolean().default(false),
});

export const adminPlanUpdateSchema = z.object({
  planId: z.string().min(1),
  // Which of the user's business pages; optional when they have only one.
  businessProfileId: z.string().min(1).optional(),
});

export type UpgradeInput = z.infer<typeof upgradeSchema>;
