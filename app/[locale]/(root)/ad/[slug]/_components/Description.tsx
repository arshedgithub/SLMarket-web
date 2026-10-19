"use client";

import { useEffect, useRef, useState } from "react";

// Collapsed after about 8 lines, with "Read more" only when it is cut off.
export function Description({
  text,
  more,
  less,
}: {
  text: string;
  more: string;
  less: string;
}) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [open, setOpen] = useState(false);
  const [clipped, setClipped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) setClipped(el.scrollHeight > el.clientHeight + 2);
  }, [text]);

  return (
    <div>
      <p
        ref={ref}
        id="ad-description"
        className={`whitespace-pre-line text-[15px] leading-relaxed text-[color:var(--color-market-text-secondary)] ${
          open ? "" : "line-clamp-[8]"
        }`}
      >
        {text}
      </p>
      {(clipped || open) && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls="ad-description"
          onClick={() => setOpen((o) => !o)}
          className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          {open ? less : more}
        </button>
      )}
    </div>
  );
}
