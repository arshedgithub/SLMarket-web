"use client";

import { useEffect, useRef, useState } from "react";
import { trimVideoFile } from "@/lib/utils/trimVideo";

const CLIP_DURATION = 15;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoTrimModal({
  file,
  duration,
  onConfirm,
  onCancel,
}: {
  file: File;
  duration: number;
  onConfirm: (trimmed: File) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startTime: number } | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingTimeRef = useRef<number | null>(null);

  const [startTime, setStartTime] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [trimming, setTrimming] = useState(false);
  const [error, setError] = useState("");
  const [trimmedFile, setTrimmedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const maxStart = Math.max(0, duration - CLIP_DURATION);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (videoRef.current) videoRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!trimmedFile) return;
    const url = URL.createObjectURL(trimmedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [trimmedFile]);

  // Live preview: whenever the selected window moves, jump the player there
  // and keep it playing — and loop back to the window start once it reaches
  // the end, so the chosen clip previews continuously without further input.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = startTime;
    video.play().catch(() => {});

    const handleTimeUpdate = () => {
      if (video.currentTime >= startTime + CLIP_DURATION) {
        video.currentTime = startTime;
      }
    };
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [startTime]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const seekTo = (time: number) => {
    setStartTime(Math.min(maxStart, Math.max(0, time)));
  };

  // Scrubbing fires many pointermove events per second — batching to one
  // seek per animation frame avoids stacking up more video seeks than the
  // browser can decode, which is what caused the laggy drag.
  const scheduleSeek = (time: number) => {
    pendingTimeRef.current = time;
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (pendingTimeRef.current !== null) {
        seekTo(pendingTimeRef.current);
        pendingTimeRef.current = null;
      }
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
    dragRef.current = { startX: e.clientX, startTime };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !dragRef.current) return;
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    const deltaTime =
      ((e.clientX - dragRef.current.startX) / rect.width) * duration;
    scheduleSeek(dragRef.current.startTime + deltaTime);
  };

  const handlePointerUp = () => {
    setDragging(false);
    dragRef.current = null;
  };

  const handleTrim = async () => {
    setTrimming(true);
    setError("");
    try {
      const trimmed = await trimVideoFile(file, startTime, CLIP_DURATION);
      setTrimmedFile(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trim video");
    } finally {
      setTrimming(false);
    }
  };

  const windowLeftPct = (startTime / duration) * 100;
  const windowWidthPct = (CLIP_DURATION / duration) * 100;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-md space-y-3">
        {!trimmedFile ? (
          <>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Choose your {CLIP_DURATION}-second clip
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag the blue bar to pick which part of the video to use. It plays
              live as you drag.
            </p>

            <video
              ref={videoRef}
              muted
              loop
              playsInline
              className="w-full aspect-square rounded-lg bg-black object-contain"
            />

            <div
              ref={timelineRef}
              className="relative h-8 flex items-center select-none"
            >
              <div className="absolute inset-x-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                  left: `${windowLeftPct}%`,
                  width: `${windowWidthPct}%`,
                  touchAction: "none",
                }}
                className="absolute h-6 bg-blue-500 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center gap-0.5"
              >
                <div className="w-0.5 h-3 bg-white/70 rounded-full" />
                <div className="w-0.5 h-3 bg-white/70 rounded-full" />
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 text-center font-semibold">
              {formatTime(startTime)} – {formatTime(startTime + CLIP_DURATION)}{" "}
              <span className="text-gray-400 font-normal">
                of {formatTime(duration)}
              </span>
            </p>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onCancel}
                disabled={trimming}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTrim}
                disabled={trimming}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {trimming ? "Trimming…" : "Trim & Continue"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Preview your clip
            </h3>
            <video
              src={previewUrl}
              controls
              autoPlay
              loop
              className="w-full aspect-square rounded-lg bg-black object-contain"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTrimmedFile(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Re-trim
              </button>
              <button
                type="button"
                onClick={() => onConfirm(trimmedFile)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Use this clip
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
