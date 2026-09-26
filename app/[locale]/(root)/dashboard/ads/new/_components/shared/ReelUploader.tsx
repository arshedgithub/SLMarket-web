"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, X, Loader2, Video, Sparkles } from "lucide-react";
import { uploadVideo } from "./uploadImage";
import { labelClass } from "./FormFields";
import { VideoTrimModal } from "./VideoTrimModal";
import { isTrimSupported } from "@/lib/utils/trimVideo";

const MAX_DURATION_SECONDS = 15;

interface ReelUploaderProps {
  value: string;
  onChange: (url: string) => void;
  canUpload: boolean;
  remaining: number | null; // null = unlimited
  maxPerMonth: number | null; // null = unlimited; 0 = plan has no reel access at all
  upgradeHref?: string;
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const objectUrl = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read video file"));
    };
    video.src = objectUrl;
  });
}

export function ReelUploader({
  value,
  onChange,
  canUpload,
  remaining,
  maxPerMonth,
  upgradeHref = "/dashboard/upgrade",
}: ReelUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pendingTrim, setPendingTrim] = useState<{
    file: File;
    duration: number;
  } | null>(null);

  const doUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadVideo(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload reel");
    } finally {
      setUploading(false);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");

    let duration: number;
    try {
      duration = await getVideoDuration(file);
    } catch {
      setError("Could not read video file");
      return;
    }

    if (duration > MAX_DURATION_SECONDS) {
      if (!isTrimSupported()) {
        setError(
          `Reel must be ${MAX_DURATION_SECONDS} seconds or shorter. Trimming isn't supported in this browser. Try Chrome or Firefox, or upload a shorter clip.`,
        );
        return;
      }
      setPendingTrim({ file, duration });
      return;
    }

    await doUpload(file);
  };

  const handleTileClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (!canUpload) {
      e.preventDefault();
      setShowUpgradeModal(true);
    }
  };

  return (
    <div className="px-2">
      <label className={labelClass}>
        Reel / Short Video{" "}
        <span className="text-xs text-gray-400 font-normal">
          (optional, max {MAX_DURATION_SECONDS}s)
        </span>
      </label>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {value ? (
          <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
            <video
              src={value}
              muted
              loop
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <label
            onClick={handleTileClick}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors p-2"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Video className="w-5 h-5" />
            )}
            <span className="text-[10px] mt-1">Add reel</span>
            {canUpload && (
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                disabled={uploading}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            )}
          </label>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {canUpload && remaining !== null && !error && (
        <p className="mt-1.5 text-xs text-gray-400">
          {remaining} reel upload{remaining === 1 ? "" : "s"} left this month
        </p>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {maxPerMonth === 0
                ? "Reels are a paid-plan feature"
                : "You've used this month's reel upload"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {maxPerMonth === 0
                ? "Upgrade to a paid plan to upload a short video for your listing."
                : "Upgrade your plan for a higher monthly reel allowance."}
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Not now
              </button>
              <Link
                href={upgradeHref}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upgrade plan
              </Link>
            </div>
          </div>
        </div>
      )}

      {pendingTrim && (
        <VideoTrimModal
          file={pendingTrim.file}
          duration={pendingTrim.duration}
          onCancel={() => setPendingTrim(null)}
          onConfirm={(trimmed) => {
            setPendingTrim(null);
            doUpload(trimmed);
          }}
        />
      )}
    </div>
  );
}
