import { Skeleton } from "@/components/ui/skeleton";
import {
  AdCardSkeleton,
  ChipRowSkeleton,
  SearchBarSkeleton,
} from "@/components/skeletons/MarketSkeletons";

// Matches the /ads pages (ListingsExperience): header with search, the
// category chips, the filter bar and the ads grid.
export default function AdsLoading() {
  return (
    <div className="marketplace-page ads-page" aria-busy="true">
      <div className="bg-gradient-to-b from-[#eaf1ff] to-[var(--color-market-background)] dark:from-[#0d1930]">
        <div className="mx-auto max-w-7xl px-4 pb-4 pt-3 sm:px-6">
          <Skeleton className="hidden h-3.5 w-36 sm:block" />
          <Skeleton className="mt-3 h-8 w-40 sm:h-9" />
          <Skeleton className="mt-2 h-4 w-56" />
          <div className="mt-4 lg:max-w-[52rem]">
            <SearchBarSkeleton />
            <div className="mt-3 hidden sm:block">
              <ChipRowSkeleton widths={["w-24", "w-28", "w-20", "w-28"]} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="pt-4">
          <ChipRowSkeleton
            widths={["w-20", "w-32", "w-32", "w-36", "w-40", "w-32", "w-40"]}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 sm:mt-5">
          <ChipRowSkeleton widths={["w-24", "w-20", "w-28", "w-24", "w-20"]} />
          <Skeleton className="hidden h-9 w-36 rounded-full md:block" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <AdCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
