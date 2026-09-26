"use client";

import Image from "next/image";
import { ImageIcon, Info, TrendingDown } from "lucide-react";
import { FieldShell, RadioRow, ToggleRow } from "../fields/Primitives";
import { getCoverImage, type AdDraft, type PricingType } from "../types";

const PRICING_TABS: { value: PricingType; label: string }[] = [
  { value: "fixed", label: "Fixed Price" },
  { value: "startingFrom", label: "Starting From" },
  { value: "contact", label: "Contact for Price" },
  { value: "free", label: "Free" },
];

export function StepPriceDeal({
  draft,
  patch,
  errors,
}: {
  draft: AdDraft;
  patch: (p: Partial<AdDraft>) => void;
  errors: Record<string, string>;
}) {
  const showAmount =
    draft.pricingType === "fixed" || draft.pricingType === "startingFrom";
  const canNegotiate = showAmount;
  const isShopContext = draft.sellerMode === "shop" || !draft.sellerMode;
  const coverImage = getCoverImage(draft);

  const formattedPrice = draft.price
    ? Number(draft.price).toLocaleString("en-LK")
    : "0";
  const previewPrice =
    draft.pricingType === "free"
      ? "Free"
      : draft.pricingType === "contact"
        ? "Contact for Price"
        : `${draft.pricingType === "startingFrom" ? "From " : ""}Rs. ${formattedPrice}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-market-text)]">
            Pricing
          </h2>
          <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
            Choose how you want to price your listing.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRICING_TABS.map((tab) => {
            const active = draft.pricingType === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => patch({ pricingType: tab.value })}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "border-primary bg-primary/[0.06] text-primary"
                    : "border-border bg-surface text-[var(--color-market-text-secondary)] hover:border-primary/30"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {showAmount && (
          <FieldShell label="Price (Rs.)" required error={errors.price}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--color-market-text-muted)]">
                Rs.
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={draft.price}
                placeholder="0"
                onChange={(e) => patch({ price: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-3.5 text-base font-semibold text-[var(--color-market-text)] outline-none transition placeholder:font-normal placeholder:text-[var(--color-market-text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </FieldShell>
        )}

        {canNegotiate && (
          <div className="space-y-3">
            <ToggleRow
              label="Negotiable"
              hint="Buyers can make offers on this item."
              checked={draft.negotiable}
              onChange={(v) => patch({ negotiable: v })}
            />
            {draft.negotiable && (
              <p className="flex items-start gap-2 rounded-xl bg-primary/[0.06] p-3.5 text-xs text-[var(--color-market-text-secondary)]">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Your listing will be shown with a &quot;Negotiable&quot; badge
                in search results.
              </p>
            )}
          </div>
        )}

        <div>
          <p className="mb-3 text-sm font-semibold text-[var(--color-market-text)]">
            Shop promotions{" "}
            <span className="font-normal text-[var(--color-market-text-muted)]">
              (Shop listings only)
            </span>
          </p>
          {!isShopContext && (
            <p className="mb-3 text-xs text-[var(--color-market-text-muted)]">
              Choose a shop in the next steps to unlock promotions.
            </p>
          )}
          <div className="space-y-2">
            <RadioRow
              label="No promotion"
              selected={draft.promotionType === "none"}
              onSelect={() => patch({ promotionType: "none" })}
            />
            <RadioRow
              label="Discount / Special Offer"
              badge="Popular"
              selected={draft.promotionType === "discount"}
              onSelect={() => patch({ promotionType: "discount" })}
            />
            <RadioRow
              label="Coupon Code"
              selected={draft.promotionType === "coupon"}
              onSelect={() => patch({ promotionType: "coupon" })}
            />
          </div>
        </div>
      </div>

      {/* Right: price preview */}
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <p className="border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-market-text-muted)]">
            Price preview
          </p>
          <div className="relative aspect-[4/3] bg-background">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={draft.title}
                fill
                sizes="280px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--color-market-text-muted)]">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="p-4">
            <p className="truncate text-sm font-semibold text-[var(--color-market-text)]">
              {draft.title || "Your title"}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <p className="text-lg font-bold text-primary">{previewPrice}</p>
              {draft.negotiable && showAmount && (
                <span className="rounded-full bg-[var(--color-market-success)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-market-success)]">
                  Negotiable
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-background p-4">
          <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-bold text-[var(--color-market-text)]">
              Auto Price Drop
            </p>
            <p className="mt-1 text-xs text-[var(--color-market-text-muted)]">
              If you reduce the price later, we&apos;ll automatically mark this
              as a &quot;Price Drop&quot; listing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
