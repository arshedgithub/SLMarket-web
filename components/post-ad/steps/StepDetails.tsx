"use client";

import { useRef, useState } from "react";
import {
  Bold,
  ChevronDown,
  Italic,
  Link2,
  List,
  ListOrdered,
  ScrollText,
  Sparkles,
} from "lucide-react";
import {
  getFieldGroups,
  type ListingField,
} from "@/config/const/listingFields";
import { categories } from "@/config/const/navLinks";
import { CategorySelect } from "../fields/CategorySelect";
import { DynamicField } from "../fields/DynamicField";
import { FieldShell, TextField } from "../fields/Primitives";
import type { AdDraft } from "../types";

function isVisible(field: ListingField, attrs: AdDraft["attributes"]) {
  if (!field.showWhen) return true;
  const v = attrs[field.showWhen.key];
  return typeof v === "string" && field.showWhen.equals.includes(v);
}

// A small, illustrative set of cross-category discovery hints (see the
// "classification ≠ discovery" idea: one canonical category, but a listing
// can still surface under a closely related browsing path). Not exhaustive —
// just enough to demonstrate the behaviour until real taxonomy mapping data
// exists.
const DISCOVERABILITY_HINTS: Record<
  string,
  { categoryId: string; subLabel: string }
> = {
  "agriculture.farm-machinery": {
    categoryId: "home-garden",
    subLabel: "Tools & DIY",
  },
  "agriculture.tools-equipment": {
    categoryId: "home-garden",
    subLabel: "Tools & DIY",
  },
  "food.fresh-produce": {
    categoryId: "agriculture",
    subLabel: "Harvest & Crops",
  },
  "home-garden.garden-outdoor": {
    categoryId: "agriculture",
    subLabel: "Seeds & Plants",
  },
  "fashion.wedding-bridal": {
    categoryId: "services",
    subLabel: "Weddings & Events",
  },
  "electronics.home-appliances": {
    categoryId: "home-garden",
    subLabel: "Kitchen & Dining",
  },
};

function insertAround(
  value: string,
  selStart: number,
  selEnd: number,
  before: string,
  after: string = before,
) {
  const selected = value.slice(selStart, selEnd) || "text";
  return {
    next:
      value.slice(0, selStart) +
      before +
      selected +
      after +
      value.slice(selEnd),
    caret: selStart + before.length + selected.length + after.length,
  };
}

function insertLinePrefix(value: string, selStart: number, prefix: string) {
  const lineStart = value.lastIndexOf("\n", selStart - 1) + 1;
  return {
    next: value.slice(0, lineStart) + prefix + value.slice(lineStart),
    caret: selStart + prefix.length,
  };
}

export function StepDetails({
  draft,
  patch,
  patchAttr,
  errors,
  onOpenPolicy,
}: {
  draft: AdDraft;
  patch: (p: Partial<AdDraft>) => void;
  patchAttr: (key: string, value: string | number | boolean) => void;
  errors: Record<string, string>;
  onOpenPolicy: () => void;
}) {
  const [showAdditional, setShowAdditional] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const activeCategory = categories.find((c) => c.id === draft.categoryId);
  const groups = getFieldGroups(draft.categoryId);
  const additionalFieldCount = groups.reduce(
    (n, g) => n + g.fields.filter((f) => isVisible(f, draft.attributes)).length,
    0,
  );

  const hint =
    DISCOVERABILITY_HINTS[`${draft.categoryId}.${draft.subcategoryId}`];
  const hintCategory = hint
    ? categories.find((c) => c.id === hint.categoryId)
    : null;

  const applyFormat = (
    fn: (v: string, s: number, e: number) => { next: string; caret: number },
  ) => {
    const el = descRef.current;
    if (!el) return;
    const { next, caret } = fn(
      draft.description,
      el.selectionStart,
      el.selectionEnd,
    );
    patch({ description: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const descLen = draft.description.trim().length;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left: category */}
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-market-text)]">
            What are you listing?
          </h2>
          <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
            Pick the category that best fits your item.
          </p>
        </div>

        <FieldShell label="Category" required error={errors.category}>
          <CategorySelect
            placeholder="Select a category"
            options={categories.map((c) => ({
              id: c.id,
              name: c.name,
              iconName: c.icon,
            }))}
            value={draft.categoryId}
            onChange={(id) =>
              patch({ categoryId: id, subcategoryId: "", attributes: {} })
            }
          />
        </FieldShell>

        {activeCategory && (
          <FieldShell label="Subcategory">
            <CategorySelect
              placeholder="Select a subcategory"
              options={activeCategory.subcategories.map((s) => ({
                id: s.id,
                name: s.name,
              }))}
              value={draft.subcategoryId}
              onChange={(id) => patch({ subcategoryId: id })}
            />
          </FieldShell>
        )}

        {hint && hintCategory && (
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-market-text)]">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              This listing may also be discoverable in
            </p>
            <p className="mt-1 text-sm font-medium text-primary">
              {hintCategory.name} → {hint.subLabel}
            </p>
            <p className="mt-1 text-xs text-[var(--color-market-text-muted)]">
              We&apos;ll automatically show your listing in relevant categories
              to reach more buyers.
            </p>
          </div>
        )}

        {draft.categoryId && (
          <button
            type="button"
            onClick={onOpenPolicy}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-market-text-muted)] hover:text-primary"
          >
            <ScrollText className="h-3.5 w-3.5" />
            Please make sure your item is allowed on SLMarket.lk. View Listing
            Policy →
          </button>
        )}
      </div>

      {/* Right: title + description */}
      <div className="space-y-5">
        <FieldShell
          label="Listing title"
          required
          hint={`${draft.title.length}/70`}
          error={errors.title}
        >
          <TextField
            value={draft.title}
            maxLength={70}
            placeholder="e.g. Petrol Brush Cutter 52cc"
            onChange={(e) => patch({ title: e.target.value })}
          />
        </FieldShell>

        <FieldShell label="Description" required error={errors.description}>
          <div className="overflow-hidden rounded-xl border border-border bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <div className="flex items-center gap-0.5 border-b border-border bg-background px-2 py-1.5">
              {[
                {
                  icon: Bold,
                  fn: (v: string, s: number, e: number) =>
                    insertAround(v, s, e, "**"),
                },
                {
                  icon: Italic,
                  fn: (v: string, s: number, e: number) =>
                    insertAround(v, s, e, "_"),
                },
                {
                  icon: List,
                  fn: (v: string, s: number) => insertLinePrefix(v, s, "- "),
                },
                {
                  icon: ListOrdered,
                  fn: (v: string, s: number) => insertLinePrefix(v, s, "1. "),
                },
                {
                  icon: Link2,
                  fn: (v: string, s: number, e: number) =>
                    insertAround(v, s, e, "[", "](url)"),
                },
              ].map(({ icon: Icon, fn }, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyFormat(fn)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-market-text-muted)] transition hover:bg-surface hover:text-[var(--color-market-text)]"
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
            <textarea
              ref={descRef}
              value={draft.description}
              maxLength={2000}
              placeholder="Describe condition, important features, what's included, etc."
              onChange={(e) => patch({ description: e.target.value })}
              className="min-h-[160px] w-full resize-y bg-transparent px-3.5 py-3 text-sm leading-relaxed text-[var(--color-market-text)] outline-none placeholder:text-[var(--color-market-text-muted)]"
            />
          </div>
          <p className="mt-1.5 text-xs text-[var(--color-market-text-muted)]">
            {descLen >= 20 && (
              <span className="font-medium text-[var(--color-market-success)]">
                ✓ Looks good!{" "}
              </span>
            )}
            {draft.description.length}/2000
          </p>
        </FieldShell>

        {additionalFieldCount > 0 && (
          <div className="rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setShowAdditional((s) => !s)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="text-sm font-semibold text-[var(--color-market-text)]">
                Additional details
                <span className="ml-1.5 font-normal text-[var(--color-market-text-muted)]">
                  ({additionalFieldCount} optional)
                </span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[var(--color-market-text-muted)] transition-transform ${
                  showAdditional ? "rotate-180" : ""
                }`}
              />
            </button>
            {showAdditional && (
              <div className="space-y-5 border-t border-border p-4">
                {groups.map((group) => {
                  const visibleFields = group.fields.filter((f) =>
                    isVisible(f, draft.attributes),
                  );
                  if (visibleFields.length === 0) return null;
                  return (
                    <div key={group.title}>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-market-text-muted)]">
                        {group.title}
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {visibleFields.map((field) => (
                          <div
                            key={field.key}
                            className={
                              field.type === "segmented" ||
                              field.type === "chips" ||
                              field.type === "multichips"
                                ? "sm:col-span-2"
                                : ""
                            }
                          >
                            <DynamicField
                              field={field}
                              value={draft.attributes[field.key]}
                              error={errors[`attr.${field.key}`]}
                              onChange={(v) => patchAttr(field.key, v)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
