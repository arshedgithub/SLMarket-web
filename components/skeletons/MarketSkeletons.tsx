import { Skeleton } from "@/components/ui/skeleton";

/*
 * Loading shapes for the marketplace pages, drawn to the same sizes as the
 * real components so nothing jumps when content arrives. Neutral tones on
 * the page background (no coloured hero).
 */

// Mirrors the grid ListingCard (ads/_components/ListingCard.tsx): 4:3 photo,
// two-line title, price, deal row, two meta rows, divider, seller row.
export function AdCardSkeleton() {
  return (
    <div className="market-listing-card flex h-full flex-col">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-1 flex-col p-3">
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="mt-2 h-4 w-2/3" />
        <Skeleton className="mt-3.5 h-5 w-1/2" />
        <div className="mt-1 h-5" />
        <Skeleton className="mt-1.5 h-3.5 w-4/5" />
        <Skeleton className="mt-2 h-3 w-3/5" />
        <div className="mt-auto pt-3">
          <div className="flex items-center gap-2 border-t border-[var(--color-market-border)] pt-2.5">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Mirrors CategoryGrid: 4 per row on phones, 7 on desktop.
export function CategoryGridSkeleton({ count = 14 }: { count?: number }) {
  return (
    <div>
      <Skeleton className="mb-4 h-6 w-48 sm:h-8 sm:w-64" />
      <div className="grid grid-cols-4 gap-x-2 gap-y-2 sm:grid-cols-5 sm:gap-3 lg:grid-cols-7">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1.5 rounded-2xl px-1 py-1.5 sm:border sm:border-[var(--color-market-border)] sm:bg-[var(--color-market-surface)] sm:px-2 sm:py-4"
          >
            <Skeleton className="h-11 w-11 rounded-full sm:h-14 sm:w-14" />
            <Skeleton className="h-3 w-14 sm:w-20" />
            <Skeleton className="h-2.5 w-10 sm:w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

// A row of pill tabs / filter chips.
export function ChipRowSkeleton({ widths }: { widths: string[] }) {
  return (
    <div className="flex gap-2 overflow-hidden">
      {widths.map((w, i) => (
        <Skeleton key={i} className={`h-9 shrink-0 rounded-full ${w}`} />
      ))}
    </div>
  );
}

// The search bar shape (input, category picker, button).
export function SearchBarSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-1.5 shadow-[0_8px_24px_rgba(15,50,120,0.06)] ${className}`}
    >
      <Skeleton className="ml-2 h-5 w-5 rounded-full" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="hidden h-8 w-36 sm:block" />
      <Skeleton className="h-11 w-11 rounded-xl" />
    </div>
  );
}
