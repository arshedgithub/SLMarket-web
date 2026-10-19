import { Skeleton } from "@/components/ui/skeleton";
import {
  AdCardSkeleton,
  CategoryGridSkeleton,
  ChipRowSkeleton,
  SearchBarSkeleton,
} from "@/components/skeletons/MarketSkeletons";

// Matches the homepage (app/[locale]/(root)/page.tsx) section for section:
// the compact search hero, the category grid and Latest ads. This is the
// (root) segment's own loading boundary; deeper routes with a different
// shape (/ads, /ad/<slug>, /businesses, /dashboard) define their own.
export default function HomeLoading() {
  return (
    <div className="marketplace-page" aria-busy="true">
      <section className="bg-gradient-to-b from-[#eaf3ff] to-[var(--color-market-background)] dark:from-[#0c1a30]">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-6 pt-7 sm:px-6 sm:pb-8 sm:pt-10 lg:pt-12">
          <Skeleton className="h-8 w-4/5 max-w-xl sm:h-11" />
          <SearchBarSkeleton className="mt-5 w-full max-w-2xl sm:mt-6" />
          <div className="mt-3 flex w-full justify-center">
            <ChipRowSkeleton
              widths={["w-20", "w-24", "w-28", "w-20", "w-24"]}
            />
          </div>
          <Skeleton className="mt-4 h-4 w-72 max-w-full" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6">
        <CategoryGridSkeleton />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-4 h-6 w-40 sm:h-8 sm:w-52" />
        <div className="mb-4">
          <ChipRowSkeleton
            widths={["w-12", "w-24", "w-24", "w-28", "w-32", "w-24", "w-28"]}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={i >= 6 ? "hidden md:block" : undefined}>
              <AdCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
