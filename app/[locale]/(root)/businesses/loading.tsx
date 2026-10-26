import { Skeleton } from "@/components/ui/skeleton";
import { SellerCardSkeleton } from "@/components/cards/CardSkeletons";

export default function BusinessesLoading() {
  return (
    <div className="marketplace-page min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>

        <Skeleton className="mb-5 h-4 w-32" />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SellerCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
