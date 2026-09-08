"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  CheckCircle2,
  Heart,
  ImageIcon,
  MapPin,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { categories } from "@/config/const/navLinks";
import { getFieldGroups } from "@/config/const/listingFields";
import type { AdDraft } from "../types";

function priceText(draft: AdDraft) {
  if (draft.priceMode === "free") return "Free";
  if (draft.priceMode === "contact") return "Contact for price";
  const n = Number(draft.price || 0);
  const formatted = n.toLocaleString("en-LK");
  return draft.priceMode === "negotiable"
    ? `Rs. ${formatted} (neg.)`
    : `Rs. ${formatted}`;
}

export function StepReview({
  draft,
  onJump,
  isLoggedIn,
  submitting,
  submitError,
  onPublish,
}: {
  draft: AdDraft;
  onJump: (index: number) => void;
  isLoggedIn: boolean;
  submitting: boolean;
  submitError: string;
  onPublish: () => void;
}) {
  const cat = categories.find((c) => c.id === draft.categoryId);
  const sub = cat?.subcategories.find((s) => s.id === draft.subcategoryId);

  const attrEntries = getFieldGroups(draft.categoryId)
    .flatMap((g) => g.fields)
    .map((f) => {
      const v = draft.attributes[f.key];
      if (v === undefined || v === "" || v === false) return null;
      const value =
        typeof v === "boolean"
          ? "Yes"
          : typeof v === "string"
            ? v.replace(/\|/g, ", ")
            : String(v) + (f.unit ? ` ${f.unit}` : "");
      return { label: f.label, value };
    })
    .filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-market-text)] sm:text-2xl">
          Review &amp; publish
        </h2>
        <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
          This is how your listing will appear.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Preview card */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="relative aspect-[4/3] bg-background">
              {draft.images[0] ? (
                <Image
                  src={draft.images[0]}
                  alt={draft.title}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[var(--color-market-text-muted)]">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <span className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm">
                <Heart className="h-4 w-4" />
              </span>
            </div>
            <div className="p-3.5">
              <h3 className="truncate text-sm font-semibold text-[var(--color-market-text)]">
                {draft.title || "Your title"}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-market-text-muted)]">
                <MapPin className="h-3 w-3" />
                {draft.city || "Location"}
              </p>
              <p className="mt-2 text-base font-bold text-primary">
                {priceText(draft)}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-3">
          <SummaryRow label="Category" onEdit={() => onJump(0)}>
            {cat?.name}
            {sub ? ` · ${sub.name}` : ""}
          </SummaryRow>

          <SummaryRow label="Details" onEdit={() => onJump(1)}>
            <p className="line-clamp-3 whitespace-pre-line text-[var(--color-market-text-secondary)]">
              {draft.description || "No description"}
            </p>
            {attrEntries.length > 0 && (
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                {attrEntries.map((a) => (
                  <div key={a.label} className="text-xs">
                    <dt className="inline text-[var(--color-market-text-muted)]">
                      {a.label}:{" "}
                    </dt>
                    <dd className="inline font-medium text-[var(--color-market-text)]">
                      {a.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </SummaryRow>

          <SummaryRow label="Photos" onEdit={() => onJump(2)}>
            {draft.images.length} photo{draft.images.length === 1 ? "" : "s"}
            {draft.videoUrl ? " · 1 video" : ""}
          </SummaryRow>

          <SummaryRow label="Location" onEdit={() => onJump(3)}>
            {draft.city ? `${draft.city}, ${draft.district}` : "Not set"}
          </SummaryRow>

          <SummaryRow label="Price & contact" onEdit={() => onJump(4)}>
            {priceText(draft)} ·{" "}
            {draft.showPhone
              ? draft.contactPhone || "Phone hidden"
              : "Chat only"}
          </SummaryRow>
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
              href="/register?next=/sell"
              className="btn-solid rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Create free account
            </Link>
            <Link
              href="/login?next=/sell"
              className="btn-outline rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Sign in
            </Link>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPublish}
          disabled={submitting}
          className="btn-solid inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold sm:w-auto"
        >
          <CheckCircle2 className="h-4 w-4" />
          {submitting ? "Publishing…" : "Publish listing"}
        </button>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-market-text-muted)]">
          {label}
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>
      <div className="mt-1.5 text-sm text-[var(--color-market-text)]">
        {children}
      </div>
    </div>
  );
}
