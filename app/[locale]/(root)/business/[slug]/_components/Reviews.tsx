"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { BadgeCheck, PenLine, Star, ThumbsUp } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type {
  StorefrontBusiness,
  StorefrontReview,
} from "@/lib/business/storefront";
import { cropStyle, formatDate, scrollToSection } from "./format";

const CARD =
  "rounded-2xl border border-[var(--color-market-border)] bg-[var(--color-market-surface)] p-4 md:p-5";
const MAIN_PAGE_REVIEWS = 3;
const FULL_PAGE_STEP = 10;

function Stars({
  value,
  className = "h-4 w-4",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${className} ${i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
        />
      ))}
    </span>
  );
}

// Only a buyer who actually contacted the business through SLMarket can
// review it. Signed out: prompt to sign in. Signed in without a recorded
// contact: explain how to become eligible. (Contact records need the lead
// tracking backend; until then no signed-in visitor is eligible.)
function WriteReviewButton({ business }: { business: StorefrontBusiness }) {
  const t = useTranslations("storefront");
  const { status } = useSession();
  const canReview = false;

  if (status === "unauthenticated") {
    return (
      <Link
        href="/login"
        className="btn-outline flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold"
      >
        <PenLine className="h-4 w-4" />
        {t("reviews.signIn")}
      </Link>
    );
  }
  if (!canReview) {
    return (
      <button
        type="button"
        onClick={() => scrollToSection("enquiry")}
        title={t("reviews.contactFirst", { name: business.name })}
        className="btn-outline flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold"
      >
        <PenLine className="h-4 w-4" />
        {t("reviews.contactFirst", { name: business.name })}
      </button>
    );
  }
  return (
    <button
      type="button"
      className="btn-solid flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-bold"
    >
      <PenLine className="h-4 w-4" />
      {t("reviews.write")}
    </button>
  );
}

function ReviewCard({
  review,
  business,
}: {
  review: StorefrontReview;
  business: StorefrontBusiness;
}) {
  const t = useTranslations("storefront");
  const locale = useLocale();
  return (
    <article className="border-t border-[var(--color-market-border)] py-4 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-market-blue-light)] text-sm font-bold text-blue-700 dark:text-blue-300">
          {review.name.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-bold text-[var(--color-market-text)]">
              {review.name}
            </span>
            <span className="flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <BadgeCheck className="h-3 w-3" />
              {t("reviews.contacted")}
            </span>
            <span className="ml-auto text-xs text-[var(--color-market-text-muted)]">
              {formatDate(review.date, locale)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Stars value={review.stars} className="h-3.5 w-3.5" />
            <span className="sr-only">
              {t("reviews.starsOf", { stars: review.stars })}
            </span>
            {review.product && (
              <span className="truncate text-xs text-[var(--color-market-text-muted)]">
                {t("reviews.about", { product: review.product })}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-market-text-secondary)]">
            {review.text}
          </p>
          {review.photos && review.photos.length > 0 && (
            <div className="mt-2 flex gap-2">
              {review.photos.map((p, i) => (
                <span
                  key={i}
                  className="relative h-16 w-20 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
                >
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                    style={cropStyle(p.crop)}
                  />
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 flex items-center gap-1 text-xs text-[var(--color-market-text-muted)]">
            <ThumbsUp className="h-3.5 w-3.5" />
            {t("reviews.helpful", { count: review.helpful })}
          </p>
          {review.reply && (
            <div className="mt-3 rounded-xl bg-[var(--color-market-surface-soft)] p-3">
              <p className="text-xs font-bold text-[var(--color-market-text)]">
                {t("reviews.reply", { name: business.name })}
                <span className="ml-2 font-normal text-[var(--color-market-text-muted)]">
                  {formatDate(review.reply.date, locale)}
                </span>
              </p>
              <p className="mt-1 text-[13px] text-[var(--color-market-text-secondary)]">
                {review.reply.text}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function ReviewsSection({
  business,
  full = false,
}: {
  business: StorefrontBusiness;
  full?: boolean;
}) {
  const t = useTranslations("storefront");
  const [stars, setStars] = useState<number | null>(null);
  const [withPhotos, setWithPhotos] = useState(false);
  const [sort, setSort] = useState<"newest" | "helpful">("newest");
  const [limit, setLimit] = useState(FULL_PAGE_STEP);
  const { rating } = business;

  const filtered = useMemo(() => {
    const list = business.reviews.filter(
      (r) =>
        (stars === null || r.stars === stars) &&
        (!withPhotos || (r.photos?.length ?? 0) > 0),
    );
    return [...list].sort((a, b) =>
      sort === "helpful" ? b.helpful - a.helpful : b.date.localeCompare(a.date),
    );
  }, [business.reviews, stars, withPhotos, sort]);
  const shown = full
    ? filtered.slice(0, limit)
    : filtered.slice(0, MAIN_PAGE_REVIEWS);

  return (
    <section id="reviews" className={`${CARD} scroll-mt-32`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-extrabold text-[var(--color-market-text)]">
            {t("reviews.title", { count: rating.count })}
          </h2>
          <p className="text-[13px] text-[var(--color-market-text-muted)]">
            {t("reviews.subtitle", { name: business.name })}
          </p>
        </div>
        <WriteReviewButton business={business} />
      </div>

      {rating.count === 0 ? (
        <div className="rounded-xl bg-[var(--color-market-surface-soft)] p-5 text-center">
          <p className="text-sm font-semibold text-[var(--color-market-text)]">
            {t("reviews.empty")}
          </p>
          <p className="mt-1 text-[13px] text-[var(--color-market-text-muted)]">
            {t("reviews.emptyDesc", { name: business.name })}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[var(--color-market-surface-soft)] p-4">
              <p className="text-4xl font-extrabold text-[var(--color-market-text)]">
                {rating.average.toFixed(1)}
                <span className="ml-1 text-sm font-medium text-[var(--color-market-text-muted)]">
                  {t("reviews.outOf")}
                </span>
              </p>
              <Stars value={rating.average} className="h-5 w-5" />
              <p className="text-xs text-[var(--color-market-text-muted)]">
                {t("reviews.count", { count: rating.count })}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-1.5">
              {[5, 4, 3, 2, 1].map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="flex w-6 shrink-0 items-center gap-0.5 font-semibold text-[var(--color-market-text-secondary)]">
                    {s}
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-market-border)]">
                    <span
                      className="block h-full rounded-full bg-blue-600"
                      style={{ width: `${rating.distribution[i]}%` }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right text-[var(--color-market-text-muted)]">
                    {rating.distribution[i]}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={stars === null}
              onClick={() => setStars(null)}
              className={`h-8 rounded-full border px-3 text-xs font-semibold ${stars === null ? "border-blue-600 bg-blue-600 text-white" : "border-[var(--color-market-border)] text-[var(--color-market-text-secondary)]"}`}
            >
              {t("reviews.filterAll")}
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={stars === s}
                onClick={() => setStars(stars === s ? null : s)}
                className={`h-8 rounded-full border px-3 text-xs font-semibold ${stars === s ? "border-blue-600 bg-blue-600 text-white" : "border-[var(--color-market-border)] text-[var(--color-market-text-secondary)]"}`}
              >
                {s}★
              </button>
            ))}
            <button
              type="button"
              aria-pressed={withPhotos}
              onClick={() => setWithPhotos((v) => !v)}
              className={`h-8 rounded-full border px-3 text-xs font-semibold ${withPhotos ? "border-blue-600 bg-blue-600 text-white" : "border-[var(--color-market-border)] text-[var(--color-market-text-secondary)]"}`}
            >
              {t("reviews.withPhotos")}
            </button>
            <select
              aria-label={t("catalogue.sort")}
              value={sort}
              onChange={(e) => setSort(e.target.value as "newest" | "helpful")}
              className="ml-auto h-8 rounded-lg border border-[var(--color-market-border)] bg-[var(--color-market-surface)] px-2 text-xs font-medium"
            >
              <option value="newest">{t("catalogue.sortNewest")}</option>
              <option value="helpful">{t("reviews.sortHelpful")}</option>
            </select>
          </div>

          <div className="mt-4">
            {shown.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--color-market-text-muted)]">
                {t("reviews.noMatch")}
              </p>
            ) : (
              shown.map((r) => (
                <ReviewCard key={r.id} review={r} business={business} />
              ))
            )}
          </div>

          {!full && rating.count > shown.length && (
            <Link
              href={`/business/${business.slug}/reviews`}
              className="mt-2 inline-flex text-sm font-semibold text-blue-600"
            >
              {t("reviews.seeAll", { count: rating.count })}
            </Link>
          )}
          {full && filtered.length > limit && (
            <button
              type="button"
              onClick={() => setLimit((l) => l + FULL_PAGE_STEP)}
              className="btn-outline mt-2 h-11 w-full rounded-xl text-sm font-semibold"
            >
              {t("catalogue.showMore")}
            </button>
          )}
        </>
      )}
    </section>
  );
}
