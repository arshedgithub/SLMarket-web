"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Play,
  X,
} from "lucide-react";
import { trackAd } from "@/lib/listings/track";

type Media = { type: "image" | "video"; url: string };

export type GalleryLabels = {
  previous: string;
  next: string;
  fullScreen: string;
  close: string;
  photoOf: string; // "Photo {n} of {total}", already filled with {total}
  video: string;
  zoom: string;
};

const THUMBS = 6;

/*
 * Main photo (4:3) with arrows, a "1 / 8" count and full-screen view;
 * thumbnails underneath ("+3" on the last when there are more); arrow keys
 * and swipe. A video, when there is one, is the second item. Only the first
 * photo loads with priority. Distinct photos seen are reported once, when
 * the visitor leaves.
 */
export function AdGallery({
  photos,
  videoUrl,
  title,
  slug,
  labels,
  overlay,
}: {
  photos: string[];
  videoUrl: string | null;
  title: string;
  slug: string;
  labels: GalleryLabels;
  overlay?: ReactNode; // mobile Save / Share
}) {
  const media: Media[] = photos.map((url) => ({ type: "image" as const, url }));
  if (videoUrl)
    media.splice(Math.min(1, media.length), 0, {
      type: "video",
      url: videoUrl,
    });
  const total = media.length;

  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const seen = useRef(new Set<number>([0]));
  const startX = useRef<number | null>(null);
  // A swipe ends with a click on whatever is under the finger; skip it.
  const swiped = useRef(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (total < 2) return;
      setZoom(null);
      setIndex((i) => {
        const next = (i + delta + total) % total;
        seen.current.add(next);
        return next;
      });
    },
    [total],
  );

  const show = (i: number) => {
    seen.current.add(i);
    setZoom(null);
    setIndex(i);
  };

  const openFull = (i = index) => {
    openerRef.current = document.activeElement as HTMLElement | null;
    show(i);
    setOpen(true);
  };

  const closeFull = useCallback(() => {
    setOpen(false);
    setZoom(null);
    openerRef.current?.focus();
  }, []);

  // Keyboard in full screen; focus moves in and comes back on close.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFull();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, go, closeFull]);

  useEffect(() => {
    const report = () =>
      trackAd("gallery_photos_viewed", {
        slug,
        viewed: seen.current.size,
        total,
      });
    window.addEventListener("pagehide", report, { once: true });
    return () => window.removeEventListener("pagehide", report);
  }, [slug, total]);

  const swipe = {
    onPointerDown: (e: React.PointerEvent) => {
      startX.current = e.clientX;
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (startX.current === null) return;
      const dx = e.clientX - startX.current;
      startX.current = null;
      if (Math.abs(dx) > 40) {
        swiped.current = true;
        go(dx < 0 ? 1 : -1);
      }
    },
  };

  const current = media[index];
  const counter = (
    <span className="flex items-center gap-1 rounded-md bg-slate-900/80 px-2 py-1 text-xs font-semibold text-white">
      <Camera aria-hidden className="h-3.5 w-3.5" />
      {index + 1} / {total}
    </span>
  );
  const arrow = (dir: -1 | 1, cls: string) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        go(dir);
      }}
      aria-label={dir < 0 ? labels.previous : labels.next}
      className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md transition hover:bg-white ${cls}`}
    >
      {dir < 0 ? (
        <ChevronLeft className="h-5 w-5" />
      ) : (
        <ChevronRight className="h-5 w-5" />
      )}
    </button>
  );

  const renderMedia = (m: Media, i: number, full: boolean) =>
    m.type === "video" ? (
      <video
        key={m.url}
        src={m.url}
        controls
        playsInline
        preload="metadata"
        className={`absolute inset-0 h-full w-full ${full ? "object-contain" : "object-cover"}`}
      />
    ) : (
      <Image
        key={m.url}
        src={m.url}
        alt={labels.photoOf.replace("{n}", String(i + 1)) + `: ${title}`}
        fill
        priority={!full && i === 0}
        sizes={full ? "100vw" : "(min-width: 1024px) 60vw, 100vw"}
        className={full ? "object-contain" : "object-cover"}
        draggable={false}
      />
    );

  if (total === 0) {
    return (
      <div className="aspect-[4/3] w-full rounded-2xl bg-slate-100 dark:bg-slate-800" />
    );
  }

  return (
    <div>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={title}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
        className="group relative -mx-4 aspect-[4/3] touch-pan-y select-none overflow-hidden bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:mx-0 sm:rounded-2xl dark:bg-slate-800"
        {...swipe}
      >
        <button
          type="button"
          onClick={() => {
            if (swiped.current) {
              swiped.current = false;
              return;
            }
            openFull();
          }}
          aria-label={labels.fullScreen}
          className="absolute inset-0 z-0 cursor-zoom-in"
        >
          {renderMedia(current, index, false)}
        </button>
        {total > 1 && (
          <>
            {arrow(-1, "left-3 hidden sm:flex")}
            {arrow(1, "right-3 hidden sm:flex")}
          </>
        )}
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2">
          {total > 1 && counter}
          <button
            type="button"
            onClick={() => openFull()}
            aria-label={labels.fullScreen}
            className="pointer-events-auto hidden h-8 w-8 items-center justify-center rounded-md bg-slate-900/80 text-white sm:flex"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        {overlay && (
          <div className="absolute right-3 top-3 z-10 flex gap-2 sm:hidden">
            {overlay}
          </div>
        )}
      </div>

      {total > 1 && (
        <ul className="mt-3 hidden grid-cols-6 gap-2 sm:grid">
          {media.slice(0, THUMBS).map((m, i) => {
            const more =
              i === THUMBS - 1 && total > THUMBS ? total - THUMBS : 0;
            return (
              <li key={m.url}>
                <button
                  type="button"
                  onClick={() => (more ? openFull(i) : show(i))}
                  aria-label={labels.photoOf.replace("{n}", String(i + 1))}
                  aria-current={i === index}
                  className={`relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 ${
                    i === index
                      ? "ring-2 ring-blue-600 ring-offset-2 ring-offset-[var(--color-market-background)]"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {m.type === "video" ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white">
                      <Play
                        aria-label={labels.video}
                        className="h-6 w-6 fill-white"
                      />
                    </span>
                  ) : (
                    <Image
                      src={m.url}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  )}
                  {more > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-sm font-semibold text-white">
                      +{more}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[70] flex flex-col bg-slate-950/95"
        >
          <div className="flex items-center justify-between p-3 text-white">
            {total > 1 ? counter : <span />}
            <button
              ref={closeRef}
              type="button"
              onClick={closeFull}
              aria-label={labels.close}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div
            className="relative flex-1 touch-pan-y select-none overflow-hidden"
            {...swipe}
          >
            {current.type === "image" ? (
              <button
                type="button"
                aria-label={labels.zoom}
                onClick={(e) => {
                  if (swiped.current) {
                    swiped.current = false;
                    return;
                  }
                  if (zoom) return setZoom(null);
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoom({
                    x: ((e.clientX - r.left) / r.width) * 100,
                    y: ((e.clientY - r.top) / r.height) * 100,
                  });
                }}
                className={`absolute inset-0 ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              >
                <span
                  className="absolute inset-0 block transition-transform duration-200"
                  style={
                    zoom
                      ? {
                          transform: "scale(2.2)",
                          transformOrigin: `${zoom.x}% ${zoom.y}%`,
                        }
                      : undefined
                  }
                >
                  {renderMedia(current, index, true)}
                </span>
              </button>
            ) : (
              renderMedia(current, index, true)
            )}
            {total > 1 && (
              <>
                {arrow(-1, "left-3 flex")}
                {arrow(1, "right-3 flex")}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
