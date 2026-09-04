import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Gem,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Clock,
  Store,
  Sparkles,
  Star,
  ChevronRight,
} from "lucide-react";
import { db } from "@/lib/db";
import { getOrSetCached } from "@/lib/redis";
import {
  GemCard,
  JewelleryCard,
  MetalCard,
  ServiceCard,
} from "@/components/cards";

// Each section below fetches and caches only the data it needs, independent
// of the others. Rendered inside its own <Suspense> boundary in page.tsx, so
// a slow/cold-cache section streams in on its own instead of blocking the
// rest of the homepage (hero, category grid, services preview, and the
// seller CTA need no DB data at all and render immediately).

const CACHE_TTL_SECONDS = 60;

// Cycled by index for the Trusted Sellers avatar circles — there's no
// stored brand color per shop, so this just keeps the row visually varied
// like the gem accent palette used elsewhere on the homepage.
const SELLER_AVATAR_COLORS = [
  "var(--color-gem-sapphire)",
  "var(--color-gem-ruby)",
  "var(--color-gem-emerald)",
  "var(--color-gold)",
];

// There's no review/rating system yet, so real shops have nothing to
// display a genuine score from. Rather than hide the rating row for real
// sellers (leaving only the fallback demo data with stars), this derives a
// stable placeholder from the seller's own id — same seller always shows
// the same score, verified sellers skew higher — so the row never sits
// empty. Swap for a real average-review query once one exists.
function placeholderRating(seed: string, isVerified: boolean): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const base = isVerified ? 4.5 : 4.0;
  const steps = hash % 5; // 0-4, in half-star increments
  return Math.min(5, base + steps * 0.5);
}

// Shown only until real shops with a shop profile exist — same pattern as
// BLOG_TOPICS_PREVIEW below, so the section isn't empty on a fresh
// database. Not linked to real shop pages (no shopSlug), so they route to
// the general sellers listing instead of a 404.
const FEATURED_SELLERS_FALLBACK = [
  { name: "Gem Palace", rating: 4.9 },
  { name: "The Ruby House", rating: 4.8 },
  { name: "Emerald Mines", rating: 4.9 },
  { name: "Golden Crown Jewellers", rating: 4.7 },
] as const;

const METALS = ["GOLD_24K", "GOLD_22K", "SILVER", "PLATINUM"] as const;
const METAL_LABELS: Record<string, string> = {
  GOLD_24K: "Gold 24K",
  GOLD_22K: "Gold 22K",
  SILVER: "Silver",
  PLATINUM: "Platinum",
};

const BLOG_TOPICS_PREVIEW = [
  {
    title: "How to Choose the Right Gemstone",
    category: "Guide",
    date: "Jul 20, 2024",
    readTime: "6 min read",
    image: "/images/categories/gems/all.png",
  },
  {
    title: "Understanding Gem Certifications",
    category: "Education",
    date: "Jul 18, 2024",
    readTime: "7 min read",
    image: "/images/categories/services/certification.png",
  },
  {
    title: "Gold Prices: What to Expect in 2024",
    category: "Market Trends",
    date: "Jul 15, 2024",
    readTime: "5 min read",
    image: "/images/categories/precious-metals/gold.png",
  },
  {
    title: "Custom Jewellery Design Explained",
    category: "Inspiration",
    date: "Jul 12, 2024",
    readTime: "6 min read",
    image: "/images/categories/services/custom_design.png",
  },
  {
    title: "How to Care for Your Fine Jewellery",
    category: "Care Tips",
    date: "Jul 10, 2024",
    readTime: "4 min read",
    image: "/images/categories/services/repair.png",
  },
] as const;

const cardForCategory: Record<
  string,
  typeof GemCard | typeof JewelleryCard | typeof MetalCard | typeof ServiceCard
> = {
  GEM: GemCard,
  JEWELLERY: JewelleryCard,
  PRECIOUS_METAL: MetalCard,
  SERVICE: ServiceCard,
};

const sellerInclude = {
  seller: {
    select: {
      name: true,
      isVerified: true,
      locationCity: true,
      subscription: { select: { plan: { select: { name: true } } } },
    },
  },
};

export async function MetalPricesSection() {
  const metalPrices = await getOrSetCached(
    "homepage:metalPrices:v1",
    CACHE_TTL_SECONDS,
    () =>
      Promise.all(
        METALS.map((metal) =>
          db.metalPrice.findFirst({
            where: { metal },
            orderBy: { fetchedAt: "desc" },
          }),
        ),
      ),
  );

  if (!metalPrices.some(Boolean)) return null;

  return (
    <section className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metalPrices.map((mp, i) => {
            if (!mp) return null;
            const change = mp.changePercent24h
              ? Number(mp.changePercent24h)
              : 0;
            const up = change >= 0;
            return (
              <div
                key={METALS[i]}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {METAL_LABELS[METALS[i]]} / g
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${Number(mp.priceUsdPerGram).toFixed(2)}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold ${
                    up ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {up ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {Math.abs(change).toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export async function FeaturedAndNewArrivalsSection() {
  const { featuredListings, newArrivals } = await getOrSetCached(
    "homepage:listings:v1",
    CACHE_TTL_SECONDS,
    async () => {
      const featuredListings = await db.listing.findMany({
        where: { status: "ACTIVE", isFeaturedHomepage: true },
        include: sellerInclude,
        orderBy: [{ isBoosted: "desc" }, { createdAt: "desc" }],
        take: 8,
      });

      // Fetched after featuredListings resolves so the same listing never
      // appears in both sections.
      const newArrivals = await db.listing.findMany({
        where: {
          status: "ACTIVE",
          id: { notIn: featuredListings.map((l) => l.id) },
        },
        include: sellerInclude,
        orderBy: { createdAt: "desc" },
        take: 8,
      });

      return { featuredListings, newArrivals };
    },
  );

  return (
    <>
      {featuredListings.length > 0 && (
        <section className="bg-[var(--color-luxury-surface)] border-y border-[var(--color-luxury-border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <p className="flex items-center gap-1.5 text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] font-semibold tracking-widest uppercase text-xs mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Trending Now
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-luxury-text)]">
                  Most Popular This Week
                </h2>
              </div>
              <Link
                href="/gems"
                className="text-sm font-medium text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredListings.map((listing) => {
                const Card = cardForCategory[listing.category];
                return <Card key={listing.id} listing={listing as never} />;
              })}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] font-semibold tracking-widest uppercase text-xs mb-2">
              Recently Added
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-luxury-text)]">
              Discover Newly Added Treasures
            </h2>
          </div>
          <Link
            href="/gems"
            className="text-sm font-medium text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] hover:underline flex items-center gap-1 whitespace-nowrap"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {newArrivals.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-luxury-text-body)]">
            <Gem className="w-10 h-10 mx-auto mb-3 text-[var(--color-luxury-border)]" />
            New listings are coming soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map((listing) => {
              const Card = cardForCategory[listing.category];
              return <Card key={listing.id} listing={listing as never} />;
            })}
          </div>
        )}
      </section>
    </>
  );
}

// Five-star row with proportional fill per star (e.g. a 4.7 rating fills
// the 5th star ~70%) rather than rounding to a single whole/half star, so
// close ratings like 4.7/4.8/4.9 still read as visually distinct.
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const fillPercent = Math.max(0, Math.min(1, rating - (i - 1))) * 100;
        return (
          <span key={i} className="relative inline-block h-3 w-3 flex-shrink-0">
            <Star className="absolute inset-0 h-3 w-3 text-[var(--color-luxury-border)]" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star className="h-3 w-3 fill-[var(--color-gold)] text-[var(--color-gold)]" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export async function FeaturedShopsSection() {
  const featuredShops = await getOrSetCached(
    "homepage:shops:v1",
    CACHE_TTL_SECONDS,
    () =>
      db.user.findMany({
        where: {
          role: "SELLER",
          subscription: { plan: { hasShopProfile: true }, status: "ACTIVE" },
        },
        select: {
          id: true,
          name: true,
          shopSlug: true,
          shopBio: true,
          shopBannerUrl: true,
          isVerified: true,
          specialties: true,
        },
        orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
        take: 4,
      }),
  );

  const sellers =
    featuredShops.length > 0
      ? featuredShops.map((shop) => ({
          key: shop.id,
          name: shop.name,
          href: `/shop/${shop.shopSlug}`,
          isVerified: shop.isVerified,
          rating: placeholderRating(shop.id, shop.isVerified),
        }))
      : FEATURED_SELLERS_FALLBACK.map((shop) => ({
          key: shop.name,
          name: shop.name,
          href: "/sellers",
          isVerified: true,
          rating: shop.rating as number,
        }));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] font-semibold tracking-widest uppercase text-xs mb-2">
            Top Seller Spotlight
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-luxury-text)]">
            Trusted Sellers
          </h2>
        </div>
        <Link
          href="/sellers"
          className="text-sm font-medium text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {/* Mobile: vertical list, capped to 3, chevron affordance. Desktop:
          card grid. Verified sits inline with the name in both — a
          dedicated row for one small badge wasted space. */}
      <div className="md:hidden space-y-3">
        {sellers.slice(0, 3).map((shop, i) => (
          <Link
            key={shop.key}
            href={shop.href}
            className="group flex items-center gap-3 rounded-xl border border-[var(--color-luxury-border)] bg-[var(--color-luxury-surface)] p-3 hover:border-[var(--color-gold)] transition-colors"
          >
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
              style={{
                backgroundColor:
                  SELLER_AVATAR_COLORS[i % SELLER_AVATAR_COLORS.length],
              }}
            >
              {shop.name?.[0]?.toUpperCase() ?? <Store className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="font-semibold text-sm text-[var(--color-luxury-text)] truncate">
                  {shop.name}
                </p>
                {shop.isVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)]" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StarRating rating={shop.rating} />
                <span className="text-xs text-[var(--color-luxury-text-body)]">
                  ({shop.rating.toFixed(1)})
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0 text-[var(--color-luxury-text-body)] group-hover:text-[var(--color-gold-hover)] transition-colors" />
          </Link>
        ))}
      </div>

      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {sellers.map((shop, i) => (
          <Link
            key={shop.key}
            href={shop.href}
            className="group flex items-center gap-4 rounded-2xl border border-[var(--color-luxury-border)] bg-[var(--color-luxury-surface)] p-4 hover:border-[var(--color-gold)] hover:shadow-md transition-all"
          >
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{
                backgroundColor:
                  SELLER_AVATAR_COLORS[i % SELLER_AVATAR_COLORS.length],
              }}
            >
              {shop.name?.[0]?.toUpperCase() ?? <Store className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-[var(--color-luxury-text)] group-hover:text-[var(--color-gold-hover)] dark:group-hover:text-[var(--color-gold-champagne)] transition-colors truncate">
                  {shop.name}
                </p>
                {shop.isVerified && (
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)]" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <StarRating rating={shop.rating} />
                <span className="text-xs text-[var(--color-luxury-text-body)]">
                  ({shop.rating.toFixed(1)})
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function BlogSection() {
  const blogPosts = await getOrSetCached(
    "homepage:blogPosts:v1",
    CACHE_TTL_SECONDS,
    () =>
      db.blogPost.findMany({
        where: { status: "PUBLISHED" },
        include: { author: { select: { name: true, avatarUrl: true } } },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
  );

  const posts =
    blogPosts.length > 0
      ? blogPosts.map((post) => ({
          key: post.id,
          href: `/blogs/${post.slug}`,
          image: post.featuredImageUrl,
          category: null as string | null,
          title: post.title,
          date: post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : null,
          readTime: `${Math.max(1, Math.round(post.content.split(/\s+/).length / 200))} min read`,
        }))
      : BLOG_TOPICS_PREVIEW.map((topic) => ({
          key: topic.title,
          href: "/blogs",
          image: topic.image as string | null,
          category: topic.category as string | null,
          title: topic.title,
          date: topic.date as string | null,
          readTime: topic.readTime,
        }));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] font-semibold tracking-widest uppercase text-xs mb-2">
            From the Journal
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-luxury-text)]">
            Stories, Guides &amp; Insights
          </h2>
        </div>
        <Link
          href="/blogs"
          className="group flex items-center gap-3 text-sm font-medium text-[var(--color-luxury-text)] whitespace-nowrap"
        >
          View All Articles
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[var(--color-luxury-border)] group-hover:border-[var(--color-gold)] group-hover:bg-[var(--color-gold)]/10 transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
      {/* Mobile: vertical list, image-left, capped to 3 so it doesn't run
          on forever on a small screen. Desktop: full grid. */}
      <div className="md:hidden divide-y divide-[var(--color-luxury-border)]">
        {posts.slice(0, 3).map((post) => (
          <Link
            key={post.key}
            href={post.href}
            className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--color-luxury-bg-secondary)]">
              {post.image ? (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[var(--color-luxury-border)]" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--color-luxury-text)] line-clamp-2 group-hover:text-[var(--color-gold-hover)] dark:group-hover:text-[var(--color-gold-champagne)] transition-colors">
                {post.title}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-luxury-text-body)] mt-1">
                {post.date && <span>{post.date}</span>}
                {post.date && <span>&middot;</span>}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readTime}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
        {posts.map((post) => (
          <Link
            key={post.key}
            href={post.href}
            className="group rounded-xl overflow-hidden border border-[var(--color-luxury-border)] bg-[var(--color-luxury-surface)] hover:border-[var(--color-gold)] hover:shadow-md transition-all"
          >
            <div className="aspect-[4/3] relative bg-[var(--color-luxury-bg-secondary)]">
              {post.image ? (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-[var(--color-luxury-border)]" />
                </div>
              )}
            </div>
            <div className="p-3 lg:p-4">
              {post.category && (
                <p className="text-[var(--color-gold-hover)] dark:text-[var(--color-gold-champagne)] font-semibold tracking-wide uppercase text-[10px] mb-1.5">
                  {post.category}
                </p>
              )}
              <p className="text-sm font-semibold text-[var(--color-luxury-text)] line-clamp-2 group-hover:text-[var(--color-gold-hover)] dark:group-hover:text-[var(--color-gold-champagne)] transition-colors mb-2">
                {post.title}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-luxury-text-body)]">
                {post.date && <span>{post.date}</span>}
                {post.date && <span>&middot;</span>}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readTime}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
