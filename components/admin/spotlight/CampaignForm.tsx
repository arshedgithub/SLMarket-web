"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Crosshair,
  ExternalLink,
  ImageUp,
  Loader2,
  Trash2,
} from "lucide-react";
import { uploadSpotlightImage } from "@/lib/uploadMedia";
import {
  HEADLINE_MAX_WORDS,
  MIN_MASTER_WIDTH,
} from "@/lib/spotlight/campaignPayload";

/*
 * Create or edit a spotlight campaign. One master image (at least 2000px
 * wide) with a focal point serves every slot size; the preview shows each
 * crop with the live headline and button, as buyers will see them. Any
 * single crop can be replaced with its own upload.
 */

type Crop = "grid" | "wide" | "list";
const CROPS: { key: Crop; label: string; ratio: string; note: string }[] = [
  {
    key: "grid",
    label: "Grid, laptop and desktop",
    ratio: "5 / 4",
    note: "2 columns",
  },
  {
    key: "wide",
    label: "Banner, phones and tablets",
    ratio: "2 / 1",
    note: "full row",
  },
  { key: "list", label: "List view", ratio: "5 / 1", note: "full width row" },
];

const CTA_PRESETS = [
  "View deals",
  "Visit shop",
  "Browse cars",
  "View ad",
  "Learn more",
];

export type CampaignFormValue = {
  kind: "IMAGE" | "BUSINESS";
  status: "DRAFT" | "SCHEDULED" | "LIVE" | "PAUSED";
  businessSlug: string;
  advertiser: string;
  tier: number;
  pinned: boolean;
  headline: string;
  subline: string;
  ctaLabel: string;
  destType: "STORE" | "LIST" | "AD" | "EXTERNAL";
  destValue: string;
  imageId: string;
  imageUrl: string;
  imageWidth: number | null;
  imageHeight: number | null;
  focalX: number;
  focalY: number;
  altText: string;
  imageOnly: boolean;
  logoId: string;
  logoUrl: string;
  overrides: Partial<Record<Crop, { id: string; url: string }>>;
  targetCategory: string;
  targetDistrict: string;
  startsAt: string; // yyyy-mm-ddThh:mm (local)
  endsAt: string;
};

export const EMPTY_CAMPAIGN: CampaignFormValue = {
  kind: "IMAGE",
  status: "DRAFT",
  businessSlug: "",
  advertiser: "",
  tier: 3,
  pinned: false,
  headline: "",
  subline: "",
  ctaLabel: "View deals",
  destType: "LIST",
  destValue: "",
  imageId: "",
  imageUrl: "",
  imageWidth: null,
  imageHeight: null,
  focalX: 0.5,
  focalY: 0.5,
  altText: "",
  imageOnly: false,
  logoId: "",
  logoUrl: "",
  overrides: {},
  targetCategory: "",
  targetDistrict: "",
  startsAt: "",
  endsAt: "",
};

const DEST_HELP: Record<CampaignFormValue["destType"], string> = {
  STORE: "The business page name, e.g. digital-hub",
  LIST: "An ads list, e.g. /ads/vehicles?location=Colombo",
  AD: "The ad page name (its slug)",
  EXTERNAL:
    "A full https:// address (no link shorteners). UTM tags are added for you.",
};

const label = "block text-sm font-semibold text-gray-800";
const input =
  "mt-1 block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const help = "mt-1 text-xs text-gray-600";

function imageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => reject(new Error("Could not read the image."));
    img.src = url;
  });
}

// ISO time to the value a datetime-local input takes, in the admin's zone.
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export function CampaignForm({
  id,
  initial,
  initialDates,
  categories,
  districts,
}: {
  id?: string;
  initial: CampaignFormValue;
  // Saved dates (ISO), shown in the admin's own time zone after mount.
  initialDates?: { startsAt: string | null; endsAt: string | null };
  categories: { id: string; name: string }[];
  districts: string[];
}) {
  const router = useRouter();
  const [v, setV] = useState<CampaignFormValue>(initial);
  useEffect(() => {
    if (!initialDates) return;
    setV((p) => ({
      ...p,
      startsAt: toLocalInput(initialDates.startsAt),
      endsAt: toLocalInput(initialDates.endsAt),
    }));
  }, [initialDates]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<{
    message: string;
    field?: string;
  } | null>(null);
  const set = <K extends keyof CampaignFormValue>(
    key: K,
    value: CampaignFormValue[K],
  ) => setV((prev) => ({ ...prev, [key]: value }));

  const headlineWords = v.headline.trim()
    ? v.headline.trim().split(/\s+/).length
    : 0;
  const position = `${Math.round(v.focalX * 100)}% ${Math.round(v.focalY * 100)}%`;

  async function upload(file: File, target: "master" | "logo" | Crop) {
    setError(null);
    setBusy(target);
    try {
      if (target === "master") {
        const { width } = await imageSize(file);
        if (width < MIN_MASTER_WIDTH) {
          throw new Error(
            `This image is ${width}px wide. Use one at least ${MIN_MASTER_WIDTH}px wide.`,
          );
        }
      }
      const up = await uploadSpotlightImage(file);
      if (target === "master") {
        setV((p) => ({
          ...p,
          imageId: up.publicId,
          imageUrl: up.url,
          imageWidth: up.width,
          imageHeight: up.height,
        }));
      } else if (target === "logo") {
        setV((p) => ({ ...p, logoId: up.publicId, logoUrl: up.url }));
      } else {
        setV((p) => ({
          ...p,
          overrides: {
            ...p.overrides,
            [target]: { id: up.publicId, url: up.url },
          },
        }));
      }
    } catch (e) {
      setError({
        message: (e as Error).message,
        field: target === "master" ? "imageId" : undefined,
      });
    } finally {
      setBusy(null);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy("save");
    const overrides = Object.fromEntries(
      Object.entries(v.overrides)
        .map(([k, o]) => [k, o?.id])
        .filter(([, idv]) => idv),
    );
    const payload = {
      kind: v.kind,
      status: v.status,
      businessSlug: v.businessSlug || null,
      advertiser: v.advertiser || null,
      tier: v.tier,
      pinned: v.pinned,
      headline: v.headline || null,
      subline: v.subline || null,
      ctaLabel: v.ctaLabel,
      destType: v.destType,
      destValue: v.destValue,
      imageId: v.imageId || null,
      imageWidth: v.imageWidth,
      imageHeight: v.imageHeight,
      focalX: v.focalX,
      focalY: v.focalY,
      altText: v.altText || null,
      imageOnly: v.imageOnly,
      logoId: v.logoId || null,
      cropOverrides: Object.keys(overrides).length ? overrides : null,
      targetCategory: v.targetCategory || null,
      targetDistrict: v.targetDistrict || null,
      startsAt: v.startsAt ? new Date(v.startsAt).toISOString() : null,
      endsAt: v.endsAt ? new Date(v.endsAt).toISOString() : null,
    };
    const res = await fetch(
      id ? `/api/admin/spotlight/${id}` : "/api/admin/spotlight",
      {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    ).catch(() => null);
    setBusy(null);
    if (!res)
      return setError({
        message: "Could not reach the server. Please try again.",
      });
    const data = (await res.json().catch(() => ({}))) as {
      message?: string;
      field?: string;
    };
    if (!res.ok)
      return setError({
        message: data.message ?? "Could not save the campaign.",
        field: data.field,
      });
    router.push("/admin/spotlight");
    router.refresh();
  }

  const fieldError = (field: string) =>
    error?.field === field ? (
      <p role="alert" className="mt-1 text-sm font-medium text-red-700">
        {error.message}
      </p>
    ) : null;

  const isImage = v.kind === "IMAGE";

  return (
    <form
      onSubmit={save}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
    >
      <div className="space-y-6">
        <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <legend className="px-1 text-sm font-bold text-gray-900">
            Campaign
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="kind" className={label}>
                Type
              </label>
              <select
                id="kind"
                value={v.kind}
                onChange={(e) =>
                  set("kind", e.target.value as CampaignFormValue["kind"])
                }
                className={input}
              >
                <option value="IMAGE">Image campaign</option>
                <option value="BUSINESS">Premium business</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className={label}>
                Status
              </label>
              <select
                id="status"
                value={v.status}
                onChange={(e) =>
                  set("status", e.target.value as CampaignFormValue["status"])
                }
                className={input}
              >
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">
                  Scheduled (runs between the dates)
                </option>
                <option value="LIVE">Live</option>
                <option value="PAUSED">Paused</option>
              </select>
            </div>
            <div>
              <label htmlFor="tier" className={label}>
                Priority tier
              </label>
              <select
                id="tier"
                value={v.tier}
                onChange={(e) => set("tier", Number(e.target.value))}
                className={input}
              >
                <option value={1}>1, Platinum</option>
                <option value={2}>2, Gold</option>
                <option value={3}>3, Silver</option>
                <option value={4}>4, Standard</option>
              </select>
              <p className={help}>
                Same-tier campaigns share impressions evenly.
              </p>
            </div>
            <label className="flex items-start gap-2.5 pt-6">
              <input
                type="checkbox"
                checked={v.pinned}
                onChange={(e) => set("pinned", e.target.checked)}
                className="mt-0.5 h-5 w-5"
              />
              <span>
                <span className="block text-sm font-semibold text-gray-800">
                  Pin to the first slot
                </span>
                <span className={help}>
                  Shown before every tier while it runs.
                </span>
              </span>
            </label>
          </div>
          <div>
            <label htmlFor="businessSlug" className={label}>
              Business {isImage ? "(optional)" : ""}
            </label>
            <input
              id="businessSlug"
              value={v.businessSlug}
              onChange={(e) => set("businessSlug", e.target.value.trim())}
              placeholder="digital-hub"
              className={input}
            />
            <p className={help}>
              The business page name. A business campaign shows its cover, logo
              and latest ads.
            </p>
            {fieldError("businessSlug")}
          </div>
          <div>
            <label htmlFor="advertiser" className={label}>
              Advertiser (optional)
            </label>
            <input
              id="advertiser"
              value={v.advertiser}
              onChange={(e) => set("advertiser", e.target.value)}
              className={input}
            />
            <p className={help}>
              Campaigns with the same advertiser never show twice on one page.
              Defaults to the business.
            </p>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <legend className="px-1 text-sm font-bold text-gray-900">
            Image
          </legend>
          <div>
            <span className={label}>
              Master image
              {isImage ? "" : " (optional, replaces the business cover)"}
            </span>
            <label className="mt-1 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-400 bg-gray-50 text-sm font-semibold text-gray-800 hover:border-blue-500">
              {busy === "master" ? (
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              ) : (
                <ImageUp aria-hidden className="h-4 w-4" />
              )}
              {v.imageId ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) =>
                  e.target.files?.[0] && upload(e.target.files[0], "master")
                }
              />
            </label>
            <p className={help}>
              JPG, PNG or WebP under 2 MB, at least 2000px wide (3000 x 1500 is
              ideal). Keep the subject in the middle 60%.
            </p>
            {fieldError("imageId")}
          </div>
          {v.imageUrl && (
            <div>
              <span className={label}>Focal point</span>
              <p className={help}>
                Click the most important part (a face, the product). Every crop
                keeps it in view.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  set(
                    "focalX",
                    Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
                  );
                  set(
                    "focalY",
                    Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
                  );
                }}
                className="relative mt-2 block w-full cursor-crosshair overflow-hidden rounded-lg"
                aria-label="Set the focal point"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.imageUrl} alt="" className="block w-full" />
                <span
                  aria-hidden
                  className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-blue-600/80 text-white shadow"
                  style={{
                    left: `${v.focalX * 100}%`,
                    top: `${v.focalY * 100}%`,
                  }}
                >
                  <Crosshair className="h-4 w-4" />
                </span>
              </button>
            </div>
          )}
          <div>
            <label htmlFor="altText" className={label}>
              Alt text{isImage ? " (required)" : ""}
            </label>
            <input
              id="altText"
              value={v.altText}
              onChange={(e) => set("altText", e.target.value)}
              maxLength={160}
              className={input}
            />
            <p className={help}>What the image shows, for screen readers.</p>
            {fieldError("altText")}
          </div>
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={v.imageOnly}
              onChange={(e) => set("imageOnly", e.target.checked)}
              className="mt-0.5 h-5 w-5"
            />
            <span>
              <span className="block text-sm font-semibold text-gray-800">
                Finished artwork (image only)
              </span>
              <span className={help}>
                Only when the text is part of the artwork. The whole slot
                becomes the link, and alt text must say what the text says.
              </span>
            </span>
          </label>
          <div>
            <span className={label}>Logo (optional)</span>
            <div className="mt-1 flex items-center gap-3">
              {v.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.logoUrl}
                  alt=""
                  className="h-11 w-11 rounded-lg border border-gray-200 object-contain"
                />
              )}
              <label className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-800 hover:border-blue-500">
                {busy === "logo" ? (
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                ) : (
                  <ImageUp aria-hidden className="h-4 w-4" />
                )}
                {v.logoId ? "Replace logo" : "Upload logo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) =>
                    e.target.files?.[0] && upload(e.target.files[0], "logo")
                  }
                />
              </label>
              {v.logoId && (
                <button
                  type="button"
                  onClick={() =>
                    setV((p) => ({ ...p, logoId: "", logoUrl: "" }))
                  }
                  className="text-sm font-semibold text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <legend className="px-1 text-sm font-bold text-gray-900">
            Text and link
          </legend>
          <div>
            <label htmlFor="headline" className={label}>
              Headline
            </label>
            <input
              id="headline"
              value={v.headline}
              onChange={(e) => set("headline", e.target.value)}
              maxLength={60}
              className={input}
            />
            <p
              className={`${help} ${headlineWords > HEADLINE_MAX_WORDS ? "font-semibold text-red-700" : ""}`}
            >
              {headlineWords} of {HEADLINE_MAX_WORDS} words. Live text, so it
              translates and never gets cropped.
            </p>
            {fieldError("headline")}
          </div>
          <div>
            <label htmlFor="subline" className={label}>
              Subline (optional)
            </label>
            <input
              id="subline"
              value={v.subline}
              onChange={(e) => set("subline", e.target.value)}
              maxLength={60}
              className={input}
            />
            <p className={help}>{v.subline.length} of 60 characters.</p>
          </div>
          <div>
            <label htmlFor="ctaLabel" className={label}>
              Button label
            </label>
            <input
              id="ctaLabel"
              list="cta-presets"
              value={v.ctaLabel}
              onChange={(e) => set("ctaLabel", e.target.value)}
              maxLength={24}
              className={input}
            />
            <datalist id="cta-presets">
              {CTA_PRESETS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {fieldError("ctaLabel")}
          </div>
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <div>
              <label htmlFor="destType" className={label}>
                Links to
              </label>
              <select
                id="destType"
                value={v.destType}
                onChange={(e) =>
                  set(
                    "destType",
                    e.target.value as CampaignFormValue["destType"],
                  )
                }
                className={input}
              >
                <option value="LIST">An ads list</option>
                <option value="STORE">A business page</option>
                <option value="AD">One ad</option>
                <option value="EXTERNAL">Another website</option>
              </select>
            </div>
            <div>
              <label htmlFor="destValue" className={label}>
                Destination
              </label>
              <input
                id="destValue"
                value={v.destValue}
                onChange={(e) => set("destValue", e.target.value)}
                className={input}
              />
              <p className={help}>{DEST_HELP[v.destType]}</p>
              {fieldError("destValue")}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <legend className="px-1 text-sm font-bold text-gray-900">
            Schedule and targeting
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startsAt" className={label}>
                Starts
              </label>
              <input
                id="startsAt"
                type="datetime-local"
                value={v.startsAt}
                onChange={(e) => set("startsAt", e.target.value)}
                className={input}
              />
              {fieldError("startsAt")}
            </div>
            <div>
              <label htmlFor="endsAt" className={label}>
                Ends
              </label>
              <input
                id="endsAt"
                type="datetime-local"
                value={v.endsAt}
                onChange={(e) => set("endsAt", e.target.value)}
                className={input}
              />
              {fieldError("endsAt")}
            </div>
            <div>
              <label htmlFor="targetCategory" className={label}>
                Only in category
              </label>
              <select
                id="targetCategory"
                value={v.targetCategory}
                onChange={(e) => set("targetCategory", e.target.value)}
                className={input}
              >
                <option value="">Any category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="targetDistrict" className={label}>
                Only in district
              </label>
              <select
                id="targetDistrict"
                value={v.targetDistrict}
                onChange={(e) => set("targetDistrict", e.target.value)}
                className={input}
              >
                <option value="">Islandwide</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className={help}>
            Targeted campaigns show only on matching pages, ahead of untargeted
            ones.
          </p>
        </fieldset>

        {error && !error.field && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {error.message}
          </p>
        )}
        {error?.field && (
          <p role="alert" className="text-sm font-medium text-red-700">
            Please fix the highlighted field.
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!!busy}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy === "save" && (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            )}
            {id ? "Save changes" : "Create campaign"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/spotlight")}
            className="h-11 rounded-lg border border-gray-300 px-5 text-sm font-semibold text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Live preview of every crop */}
      <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <h2 className="text-sm font-bold text-gray-900">Preview</h2>
        {!v.imageUrl && !isImage ? (
          <p className="text-sm text-gray-600">
            Business campaigns use the business cover, logo and latest ads
            unless you upload an image.
          </p>
        ) : !v.imageUrl ? (
          <p className="text-sm text-gray-600">
            Upload the master image to see every crop.
          </p>
        ) : (
          CROPS.map((crop) => {
            const override = v.overrides[crop.key];
            return (
              <div key={crop.key}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-700">
                    {crop.label}{" "}
                    <span className="font-normal text-gray-600">
                      ({crop.ratio.replace(" / ", ":")}, {crop.note})
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer text-xs font-semibold text-blue-700 hover:underline">
                      {busy === crop.key
                        ? "Uploading..."
                        : override
                          ? "Replace crop"
                          : "Upload own crop"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          upload(e.target.files[0], crop.key)
                        }
                      />
                    </label>
                    {override && (
                      <button
                        type="button"
                        aria-label={`Remove the ${crop.label} crop`}
                        onClick={() =>
                          setV((p) => ({
                            ...p,
                            overrides: {
                              ...p.overrides,
                              [crop.key]: undefined,
                            },
                          }))
                        }
                        className="text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div
                  className="relative overflow-hidden rounded-xl bg-gray-200"
                  style={{ aspectRatio: crop.ratio }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={override?.url ?? v.imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: override ? "50% 50%" : position }}
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    Sponsored
                  </span>
                  {v.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.logoUrl}
                      alt=""
                      className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-white object-contain p-0.5"
                    />
                  )}
                  {!v.imageOnly && (
                    <div
                      className={`absolute inset-0 flex p-3 ${
                        crop.key === "list"
                          ? "items-center justify-between bg-gradient-to-r from-black/75 via-black/40 to-transparent"
                          : "flex-col justify-end bg-[linear-gradient(to_top,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.45)_30%,transparent_55%)]"
                      }`}
                    >
                      <div className="text-white">
                        <p className="text-sm font-bold leading-tight">
                          {v.headline || "Your headline"}
                        </p>
                        {v.subline && (
                          <p className="text-xs text-white/90">{v.subline}</p>
                        )}
                      </div>
                      <span
                        className={`inline-flex h-8 w-fit items-center gap-1 rounded-lg bg-white px-3 text-xs font-semibold text-slate-900 ${crop.key === "list" ? "" : "mt-2"}`}
                      >
                        {v.ctaLabel || "Button"}
                        {v.destType === "EXTERNAL" ? (
                          <ExternalLink className="h-3 w-3" />
                        ) : (
                          <ArrowRight className="h-3 w-3" />
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </aside>
    </form>
  );
}
