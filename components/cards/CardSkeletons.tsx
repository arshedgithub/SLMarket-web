import { Skeleton } from "@/components/ui/skeleton";

// Mirrors a listing card: square image, 2-line title, a meta row, a seller
// row, then price.
export function ListingCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3 mt-1" />
      </div>
    </div>
  );
}

// Mirrors ServiceCard: wide image, title + description lines, a meta row,
// seller row, then a divided footer with price + CTA.
export function ServiceCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-3 mt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-24 mt-1" />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
}

// Mirrors the business card used on /businesses and the homepage's
// "Featured Businesses" section: banner, overlapping avatar, bio, footer row.
export function SellerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="p-4">
        <div className="flex items-start gap-3 -mt-8 mb-2">
          <Skeleton className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-900 shrink-0" />
        </div>
        <Skeleton className="h-4 w-1/2 mt-2" />
        <Skeleton className="h-3 w-1/3 mt-2" />
        <Skeleton className="h-3 w-full mt-3" />
        <Skeleton className="h-3 w-2/3 mt-1.5" />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
