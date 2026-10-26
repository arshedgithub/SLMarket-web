import { Skeleton } from "@/components/ui/skeleton";

// Matches the ad page: breadcrumb, gallery (4:3 + thumbnails) on the left,
// the price and contact panel on the right, key details below the gallery.
export default function AdLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 sm:pt-6"
      aria-busy="true"
    >
      <Skeleton className="mb-4 h-4 w-72 max-w-full" />
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <Skeleton className="-mx-4 aspect-[4/3] rounded-none sm:mx-0 sm:rounded-2xl" />
          <div className="mt-3 hidden grid-cols-6 gap-2 sm:grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
            ))}
          </div>
        </div>

        <div className="mt-5 lg:col-span-5 lg:row-span-2 lg:mt-0">
          <div className="rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-4 sm:p-5">
            <Skeleton className="h-6 w-11/12" />
            <Skeleton className="mt-2 h-6 w-1/2" />
            <Skeleton className="mt-4 h-9 w-44" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-6 w-14 rounded-lg" />
              <Skeleton className="h-6 w-36 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
            <Skeleton className="mt-3 h-4 w-48" />
            <div className="mt-5 hidden space-y-2.5 md:block">
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-2.5">
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 border-t border-[var(--color-market-border)] pt-4">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            </div>
            <Skeleton className="mt-4 h-11 w-full rounded-xl" />
          </div>
        </div>

        <div className="mt-8 lg:col-span-7">
          <Skeleton className="mb-3 h-5 w-32" />
          <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between gap-4 border-b border-[var(--color-market-border)] px-4 py-3"
              >
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-24" />
              </div>
            ))}
          </div>
          <Skeleton className="mb-3 mt-8 h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}
