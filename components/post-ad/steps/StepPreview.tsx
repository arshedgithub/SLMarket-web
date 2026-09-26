"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  CheckCircle2,
  Heart,
  ImageIcon,
  MapPin,
  Pencil,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import { categories } from "@/config/const/navLinks";
import { SAMPLE_USER_SHOPS } from "@/lib/sampleUserShops";
import { getCoverImage, type AdDraft } from "../types";

function priceText(draft: AdDraft) {
  if (draft.pricingType === "free") return "Free";
  if (draft.pricingType === "contact") return "Contact for price";
  const n = Number(draft.price || 0);
  const formatted = n.toLocaleString("en-LK");
  const prefix = draft.pricingType === "startingFrom" ? "From " : "";
  return `${prefix}Rs. ${formatted}`;
}

function locationText(draft: AdDraft) {
  if (draft.locationType === "islandwide") return "Islandwide";
  if (draft.locationType === "branches")
    return `${draft.selectedBranchIds.length} branch${draft.selectedBranchIds.length === 1 ? "" : "es"}`;
  return draft.city ? `${draft.city}, ${draft.district}` : "Not set";
}

export function StepPreview({
  draft,
  patch,
  onJump,
  isLoggedIn,
  submitting,
  submitError,
  onPublish,
  onOpenPolicy,
}: {
  draft: AdDraft;
  patch: (p: Partial<AdDraft>) => void;
  onJump: (index: number) => void;
  isLoggedIn: boolean;
  submitting: boolean;
  submitError: string;
  onPublish: () => void;
  onOpenPolicy: () => void;
}) {
  const cat = categories.find((c) => c.id === draft.categoryId);
  const sub = cat?.subcategories.find((s) => s.id === draft.subcategoryId);
  const shop = SAMPLE_USER_SHOPS.find((s) => s.id === draft.shopId);
  const coverImage = getCoverImage(draft);

  const checklist = [
    { label: "Listing details", step: 0 },
    {
      label:
        draft.images.length > 0
          ? `Photos (${draft.images.length})`
          : coverImage
            ? "Photos (default thumbnail)"
            : "Photos (none)",
      step: 1,
    },
    { label: "Price & deal", step: 2 },
    { label: "Location & availability", step: 3 },
    { label: "Seller information", step: 4 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--color-market-text)]">
          Listing preview
        </h2>
        <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
          Check your details before publishing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Preview card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="relative aspect-[16/9] bg-background">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={draft.title}
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--color-market-text-muted)]">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
            {draft.negotiable && (
              <span className="absolute left-3 top-3 rounded-full bg-[var(--color-market-success)] px-2.5 py-1 text-xs font-bold text-white">
                Negotiable
              </span>
            )}
            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm">
              <Heart className="h-4 w-4" />
            </span>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-bold text-[var(--color-market-text)]">
              {draft.title || "Your title"}
            </h3>
            <p className="mt-1 text-2xl font-extrabold text-primary">
              {priceText(draft)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--color-market-text-muted)]">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {locationText(draft)}
              </span>
              <span>
                {cat?.name}
                {sub ? ` → ${sub.name}` : ""}
              </span>
              {draft.deliveryAvailable && (
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  Delivery available
                </span>
              )}
              {shop && (
                <span className="flex items-center gap-1">
                  <Store className="h-3.5 w-3.5" />
                  {shop.name}
                </span>
              )}
            </div>

            {draft.description && (
              <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-[var(--color-market-text-secondary)]">
                {draft.description}
              </p>
            )}
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[var(--color-market-text-muted)]">
              Checklist
            </p>
            <p className="mb-3 text-xs text-[var(--color-market-text-muted)]">
              Check your details before publishing.
            </p>
            <div className="space-y-1">
              {checklist.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-background"
                >
                  <span className="flex items-center gap-2 text-sm text-[var(--color-market-text)]">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-market-success)]" />
                    {item.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onJump(item.step)}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl border border-[var(--color-market-success)]/30 bg-[var(--color-market-success)]/[0.07] p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-market-success)]" />
            <div>
              <p className="text-sm font-bold text-[var(--color-market-text)]">
                Ready to publish!
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-market-text-muted)]">
                Your listing looks great. Click the button below to publish.
              </p>
            </div>
          </div>
        </div>
      </div>

      {submitError && (
        <p className="rounded-xl border border-[var(--color-market-danger)]/30 bg-[var(--color-market-danger)]/10 px-4 py-3 text-sm font-medium text-[var(--color-market-danger)]">
          {submitError}
        </p>
      )}

      {!isLoggedIn ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/[0.06] p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-market-text)]">
            <ShieldCheck className="h-4 w-4 text-primary" />
            One quick step before you publish
          </p>
          <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
            Sign in or create a free account to post your ad. Your draft is
            saved and will be here when you get back.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/register?next=/post-ad"
              className="btn-solid rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Create free account
            </Link>
            <Link
              href="/login?next=/post-ad"
              className="btn-outline rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Sign in
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3 border-t border-border pt-5">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={draft.policyAccepted}
              onChange={(e) => patch({ policyAccepted: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            <span className="text-sm text-[var(--color-market-text)]">
              I confirm that this listing follows the{" "}
              <button
                type="button"
                onClick={onOpenPolicy}
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <ScrollText className="h-3.5 w-3.5" />
                Listing Policy
              </button>{" "}
              and that the information provided is accurate.
            </span>
          </label>
          <p className="pl-6.5 text-xs text-[var(--color-market-text-muted)]">
            By publishing, you agree to SLMarket.lk&apos;s Terms of Service and
            confirm that your listing complies with the Listing Policy.
          </p>

          <button
            type="button"
            onClick={onPublish}
            disabled={submitting || !draft.policyAccepted}
            className="btn-solid inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <CheckCircle2 className="h-4 w-4" />
            {submitting ? "Publishing…" : "Publish Listing"}
          </button>
        </div>
      )}
    </div>
  );
}
