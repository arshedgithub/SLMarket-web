"use client";

import { useState } from "react";
import Image from "next/image";
import { Film, ImagePlus, Loader2, Star, X } from "lucide-react";
import { uploadImage, uploadVideo } from "@/lib/uploadMedia";
import type { AdDraft } from "../types";

const MAX_IMAGES = 8;

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
  const [videoUploading, setVideoUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError("");
    const room = MAX_IMAGES - draft.images.length;
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

  const handleVideo = async (file: File | undefined) => {
    if (!file) return;
    setUploadError("");
    setVideoUploading(true);
    try {
      patch({ videoUrl: await uploadVideo(file, "reels") });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Video upload failed");
    } finally {
      setVideoUploading(false);
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
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-market-text)] sm:text-2xl">
          Show it off
        </h2>
        <p className="mt-1 text-sm text-[var(--color-market-text-muted)]">
          Listings with 3+ clear photos sell far faster. First photo is the
          cover.
        </p>
      </div>

      <div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
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
              <div className="absolute inset-0 flex items-start justify-between p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => makeCover(i)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white"
                  aria-label="Make cover photo"
                >
                  <Star
                    className={`h-3.5 w-3.5 ${i === 0 ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white"
                  aria-label="Remove photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Cover
                </span>
              )}
            </div>
          ))}

          {draft.images.length < MAX_IMAGES && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-[var(--color-market-text-muted)] transition hover:border-primary/50 hover:text-primary">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
              <span className="text-[11px] font-medium">Add photos</span>
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
        <p className="mt-2 text-xs text-[var(--color-market-text-muted)]">
          {draft.images.length}/{MAX_IMAGES} photos
        </p>
        {(uploadError || errors.images) && (
          <p className="mt-1.5 text-xs font-medium text-[var(--color-market-danger)]">
            {uploadError || errors.images}
          </p>
        )}
      </div>

      {/* Optional video */}
      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-market-text)]">
              <Film className="h-4 w-4 text-primary" />
              Add a short video
              <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-[var(--color-market-text-muted)]">
                Optional
              </span>
            </p>
            <p className="mt-1 text-xs text-[var(--color-market-text-muted)]">
              A 15-30s walk-around builds trust and gets 2x more views.
            </p>
          </div>
          {draft.videoUrl ? (
            <button
              type="button"
              onClick={() => patch({ videoUrl: "" })}
              className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-[var(--color-market-text-secondary)] hover:border-primary/40"
            >
              Remove
            </button>
          ) : (
            <label className="shrink-0 cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10">
              {videoUploading ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                hidden
                disabled={videoUploading}
                onChange={(e) => handleVideo(e.target.files?.[0])}
              />
            </label>
          )}
        </div>
        {draft.videoUrl && (
          <video
            src={draft.videoUrl}
            controls
            className="mt-3 max-h-56 w-full rounded-xl bg-black"
          />
        )}
      </div>
    </div>
  );
}
