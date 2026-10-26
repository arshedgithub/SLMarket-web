import Image from "next/image";
import { ArrowRight, CheckCircle2, PencilLine } from "lucide-react";
import { Link } from "@/i18n/navigation";

/*
 * The "sell" banner before the footer. The products photo never sits under
 * the text. On desktop the copy and the call to action stand on a solid sky
 * colour (taken from the photo's own edges), and the photo sits between
 * them, fading into that colour at its ends. Phones and tablets stack the
 * copy, the actions, then the photo. Personal ads are free (business plans
 * are separate), so "Free" is accurate.
 */
export function SellCta({
  t,
}: {
  t: {
    eyebrow: string;
    heading: string;
    desc: string;
    benefits: string[];
    panelTitle: string;
    panelDesc: string;
    ctaPost: string;
    ctaShop: string;
  };
}) {
  const actions = (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center xl:flex-col xl:items-stretch">
      <Link
        href="/post-ad"
        className="btn-solid inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold shadow-[0_10px_24px_-10px_rgba(21,87,214,0.6)]"
      >
        {t.ctaPost}
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
      <Link
        href="/business/new"
        className="inline-flex h-11 items-center justify-center gap-1 rounded-full px-4 text-sm font-semibold text-[#1557d6] hover:bg-white/70 dark:text-blue-300 dark:hover:bg-white/10"
      >
        {t.ctaShop}
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </div>
  );

  return (
    <section
      aria-labelledby="sell-heading"
      className="relative isolate overflow-hidden rounded-3xl border border-[var(--color-market-border)] bg-[#e3f1fd] dark:bg-[#0f1b2e]"
    >
      {/* Desktop: the photo (2000 x 742) between the copy and the panel.
          Placed so the car starts just after the copy column and the
          headphones end before the panel; its empty sky and the trees fade
          into the card colour. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[190px] -z-10 hidden h-[300px] w-[809px] [mask-image:linear-gradient(to_right,transparent_0%,black_26%,black_90%,transparent_100%),linear-gradient(to_bottom,transparent_0%,black_18%)] [mask-composite:intersect] xl:block"
      >
        <Image
          src="/images/marketplace/sell-cta.webp"
          alt=""
          fill
          sizes="809px"
          className="object-cover dark:opacity-50"
        />
      </div>

      <div className="grid gap-6 p-6 sm:p-8 xl:min-h-[320px] xl:grid-cols-[360px_1fr_250px] xl:items-center xl:gap-6 xl:px-10 xl:py-8">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#1557d6] shadow-sm dark:bg-white/10 dark:text-blue-300">
            {t.eyebrow}
          </p>
          <h2
            id="sell-heading"
            className="font-heading mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-[#10213f] sm:text-[34px] xl:text-[30px] dark:text-white"
          >
            {t.heading}
          </h2>
          <p className="mt-3 text-[15px] leading-6 text-slate-700 sm:text-base xl:text-[15px] dark:text-slate-300">
            {t.desc}
          </p>
          <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5 xl:flex-col xl:gap-1.5">
            {t.benefits.map((b) => (
              <li
                key={b}
                className="flex items-center gap-2 text-sm font-semibold text-[#10213f] dark:text-slate-100"
              >
                <CheckCircle2
                  aria-hidden
                  className="h-5 w-5 shrink-0 fill-[#1557d6] text-white"
                />
                {b}
              </li>
            ))}
          </ul>
          {/* Phones and tablets: the actions follow the copy. */}
          <div className="mt-6 xl:hidden">{actions}</div>
        </div>

        {/* Middle column: the photo shows here on desktop. */}
        <div aria-hidden className="hidden xl:block" />

        <div className="hidden xl:block">
          <div className="border-l border-[#1557d6]/20 pl-6">
            <p className="flex items-start gap-3">
              <PencilLine
                aria-hidden
                className="mt-0.5 h-7 w-7 shrink-0 text-[#1557d6]"
              />
              <span className="text-lg font-bold leading-snug text-[#10213f] dark:text-white">
                {t.panelTitle}
              </span>
            </p>
            <p className="mt-1 pl-10 text-sm text-slate-700 dark:text-slate-300">
              {t.panelDesc}
            </p>
            <div className="mt-5">{actions}</div>
          </div>
        </div>
      </div>

      {/* Phones and tablets: the photo under the copy, trimmed only of the
          empty sky on its left so every product shows. */}
      <div className="relative aspect-[1450/742] max-h-[340px] w-full [mask-image:linear-gradient(to_bottom,transparent_0%,black_14%)] xl:hidden">
        <Image
          src="/images/marketplace/sell-cta.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[68%_50%] dark:opacity-60"
        />
      </div>
    </section>
  );
}
