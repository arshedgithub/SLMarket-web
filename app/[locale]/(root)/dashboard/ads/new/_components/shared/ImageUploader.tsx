"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, X, Loader2, Sparkles } from "lucide-react";
import { uploadImage } from "./uploadImage";
import { labelClass } from "./FormFields";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  label?: string;
  isPlanLimited?: boolean;
  upgradeHref?: string;
  // Whether at least one photo is required — false when a reel/video has
  // already been uploaded, since that covers the "at least one media" rule.
  required?: boolean;
}

export function ImageUploader({
  images,
  onChange,
  max = 3,
  label = "Photos",
  isPlanLimited = false,
  upgradeHref = "/dashboard/upgrade",
  required = true,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");

    const remaining = max - images.length;
    const selected = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      setError(`You can upload up to ${max} photos.`);
    }

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of selected) {
        uploaded.push(await uploadImage(file, "listings"));
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="px-2">
      <label className={labelClass}>
        {label} {required && <span className="text-red-500">*</span>}
        <span className="ml-1 text-xs text-gray-400 font-normal">
          ({images.length}/{max})
        </span>
        {!required && (
          <span className="ml-1 text-xs text-gray-400 font-normal">
            (optional, you&apos;ve already added a video)
          </span>
        )}
      </label>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((src, i) => (
          <div
            key={src}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                Cover
              </span>
            )}
          </div>
        ))}

        {images.length < max && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors p-2">
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            <span className="text-[10px] mt-1">Add photo</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              disabled={uploading}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {!error && isPlanLimited && images.length >= max && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          Want to add more photos?{" "}
          <Link
            href={upgradeHref}
            className="font-medium text-primary hover:underline"
          >
            Upgrade your plan
          </Link>{" "}
          for more image uploads.
        </p>
      )}
    </div>
  );
}
