import { Skeleton } from "@/components/ui/skeleton";
import {
  ListingCardSkeleton,
  SellerCardSkeleton,
} from "@/components/cards/CardSkeletons";

// Matches the homepage (app/(root)/page.tsx) section-for-section, since this
// is the loading boundary for the (root) segment's own page — "/". Routes
// nested deeper that need a different shape define their own loading.tsx,
// which takes precedence over this one.
export default function HomeLoading() {
  return (
    <div className="bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark to-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center flex flex-col items-center gap-4">
          <Skeleton light className="h-3 w-72" />
          <Skeleton light className="h-10 md:h-14 w-full max-w-xl" />
          <Skeleton light className="h-10 md:h-14 w-2/3 max-w-md" />
          <Skeleton light className="h-4 w-full max-w-2xl mt-2" />
          <Skeleton light className="h-4 w-5/6 max-w-xl" />
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <Skeleton light className="h-12 w-40" />
            <Skeleton light className="h-12 w-44" />
          </div>
        </div>
      </section>

      {/* Shop by category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <Skeleton className="h-7 w-56 mx-auto mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800"
            >
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="py-3 flex justify-center">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="bg-gradient-to-b from-amber-50 to-gray-50 dark:from-amber-950/15 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="mb-8 space-y-3">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex flex-col items-center gap-3 mb-8">
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800"
              >
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="py-3 flex justify-center">
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured businesses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <SellerCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Trust band */}
      <section className="bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton light className="h-6 w-16" />
              <Skeleton light className="h-3 w-24" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
