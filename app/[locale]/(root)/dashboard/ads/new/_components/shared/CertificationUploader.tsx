"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Upload,
  X,
  Loader2,
  FileCheck,
  FileText,
  Sparkles,
} from "lucide-react";
import { uploadImage } from "./uploadImage";
import { labelClass } from "./FormFields";

const ACCEPTED =
  "image/jpeg,image/png,image/webp,image/avif,image/tiff,application/pdf";

interface CertificationUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  label?: string;
  hint?: string;
  isPlanLimited?: boolean;
  upgradeHref?: string;
}

function isPdf(url: string) {
  return (
    url.toLowerCase().includes(".pdf") ||
    url.toLowerCase().includes("application/pdf")
  );
}

export function CertificationUploader({
  images,
  onChange,
  max = 5,
  label = "Certification documents (optional)",
  hint = "Upload photos of lab reports, hallmark stamps, assay certificates, or PDF documents.",
  isPlanLimited = false,
  upgradeHref = "/dashboard/upgrade",
}: CertificationUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");

    const remaining = max - images.length;
    const selected = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      setError(`You can upload up to ${max} documents.`);
    }

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of selected) {
        uploaded.push(await uploadImage(file, "documents"));
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload document",
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const getFilename = (url: string) => {
    try {
      return decodeURIComponent(
        url.split("/").pop()?.split("?")[0] ?? "document",
      );
    } catch {
      return "document";
    }
  };

  return (
    <div className="px-2">
      <label className={labelClass}>{label}</label>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((src, i) => (
          <div
            key={src}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center"
          >
            {isPdf(src) ? (
              <div className="flex flex-col items-center gap-1 px-2 text-center">
                <FileText className="w-8 h-8 text-red-400" />
                <span className="text-[9px] text-gray-500 truncate w-full text-center">
                  {getFilename(src)}
                </span>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-blue-500 hover:underline"
                >
                  View PDF
                </a>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={`Certificate ${i + 1}`}
                className="w-full h-full object-cover"
              />
            )}
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {images.length < max && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-green-400 hover:text-green-500 transition-colors p-2">
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <FileCheck className="w-5 h-5" />
                <Upload className="w-3 h-3" />
              </div>
            )}
            <span className="text-[10px] mt-1 text-center px-1">
              Image or PDF
            </span>
            <input
              type="file"
              accept={ACCEPTED}
              multiple
              disabled={uploading}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>

      {hint && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {!error && isPlanLimited && images.length >= max && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          Want to upload more documents?{" "}
          <Link
            href={upgradeHref}
            className="font-medium text-primary hover:underline"
          >
            Upgrade your plan
          </Link>{" "}
          for more uploads.
        </p>
      )}
    </div>
  );
}
