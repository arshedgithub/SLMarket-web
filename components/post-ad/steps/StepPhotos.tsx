"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  Film,
  Loader2,
  Lock,
  MoreVertical,
  Plus,
  Star,
  UploadCloud,
  X,
} from "lucide-react";
import { uploadImage } from "@/lib/uploadMedia";
import { getImageLimits, type AdDraft } from "../types";

const TIPS = [
  "Use clear, recent photos",
  "Show the actual item (not stock photos)",
  "Good lighting, multiple angles",
  "Avoid text or contact numbers in images",
];

export function StepPhotos({
  draft,
  patch,
  errors,
}: {
  draft: AdDraft;
  patch: (p: Partial<AdDraft>) => void;
  errors: Record<string, string>;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);

  const { min: minImages, max: maxImages } = getImageLimits(draft.categoryId);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError("");
    const room = maxImages - draft.images.length;
    const picked = Array.from(files).slice(0, room);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of picked) urls.push(await uploadImage(file, "listings"));
      patch({ images: [...draft.images, ...urls] });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (i: number) =>
    patch({ images: draft.images.filter((_, idx) => idx !== i) });

  const makeCover = (i: number) => {
    if (i === 0) return;
    const next = [...draft.images];
    const [moved] = next.splice(i, 1);
    next.unshift(moved);
    patch({ images: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--color-market-text)]">
          Add photos
          {minImages === 0 && (
            <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-[var(--color-market-text-muted)]">
              Optional
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
          {minImages === 0
            ? `Photos are optional here, but you can add up to ${maxImages} to stand out.`
            : `Upload clear photos of your item. You can add up to ${maxImages} photos.`}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        {/* Drop zone */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed p-6 text-center transition ${
            dragOver
              ? "border-primary bg-primary/[0.06]"
              : "border-border bg-background hover:border-primary/40"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
          </span>
          <p className="text-sm font-semibold text-[var(--color-market-text)]">
            Drag &amp; drop photos here
          </p>
          <p className="text-xs text-[var(--color-market-text-muted)]">or</p>
          <span className="btn-outline rounded-lg px-4 py-2 text-xs font-semibold">
            Browse Files
          </span>
          <p className="mt-1 text-[11px] text-[var(--color-market-text-muted)]">
            JPG, PNG up to 10MB each
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            hidden
            disabled={uploading || draft.images.length >= maxImages}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        {/* Tips */}
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-market-text-muted)]">
            Tips for great photos
          </p>
          <ul className="space-y-2">
            {TIPS.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2 text-xs text-[var(--color-market-text-secondary)]"
              >
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-market-success)]" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {(uploadError || errors.images) && (
        <p className="text-xs font-medium text-[var(--color-market-danger)]">
          {uploadError || errors.images}
        </p>
      )}

      {/* Uploaded thumbnails */}
      <div>
        <p className="mb-2.5 text-sm font-semibold text-[var(--color-market-text)]">
          Uploaded photos ({draft.images.length}/{maxImages})
        </p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {draft.images.map((src, i) => (
            <div
              key={src}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border"
            >
              <Image
                src={src}
                alt={`Photo ${i + 1}`}
                fill
                sizes="160px"
                className="object-cover"
              />
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => setMenuOpenFor(menuOpenFor === i ? null : i)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Photo options"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
              {menuOpenFor === i && (
                <div className="absolute right-1.5 top-8 z-10 w-32 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        makeCover(i);
                        setMenuOpenFor(null);
                      }}
                      className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs font-medium text-[var(--color-market-text)] hover:bg-background"
                    >
                      <Star className="h-3 w-3" /> Set as cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      removeImage(i);
                      setMenuOpenFor(null);
                    }}
                    className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs font-medium text-[var(--color-market-danger)] hover:bg-background"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
              )}
            </div>
          ))}

          {draft.images.length < maxImages && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-[var(--color-market-text-muted)] transition hover:border-primary/50 hover:text-primary">
              <Plus className="h-5 w-5" />
              <span className="text-[11px] font-medium">Add more</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                hidden
                disabled={uploading}
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          )}
        </div>
      </div>

      {/* Video — paid-plan feature, not available yet */}
      <div className="rounded-2xl border border-dashed border-border bg-background p-5 opacity-70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-market-text)]">
              <Film className="h-4 w-4 text-[var(--color-market-text-muted)]" />
              Add a short video
              <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-[var(--color-market-text-muted)]">
                <Lock className="mr-1 inline h-2.5 w-2.5" />
                Premium
              </span>
            </p>
            <p className="mt-1 text-xs text-[var(--color-market-text-muted)]">
              Short walk-around videos (up to 20s) are coming with paid business
              plans.
            </p>
          </div>
          <span className="shrink-0 cursor-not-allowed rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-[var(--color-market-text-muted)]">
            Upload
          </span>
        </div>
      </div>
    </div>
  );
}
