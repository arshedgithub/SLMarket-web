import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Safety tips for buyers and sellers",
  description:
    "How to buy and sell safely on SLMarket.lk: never pay in advance, meet in public, check the item, and report anything suspicious.",
};

const TIPS: { title: string; body: string }[] = [
  {
    title: "Never pay in advance",
    body: 'Do not send money, a deposit or a "delivery fee" before you have seen the item. Genuine sellers are happy to wait until you have checked it.',
  },
  {
    title: "Meet in a public place",
    body: "Meet in a busy, well-lit place such as a shopping centre or near a police station, ideally during the day, and bring someone with you for valuable items.",
  },
  {
    title: "Check the item before you pay",
    body: "Test that it works, check serial and chassis numbers, and compare it with the photos and description. For vehicles and property, check the documents and ownership.",
  },
  {
    title: "Be careful with prices that look too good",
    body: "A price far below similar ads, pressure to decide quickly, or a seller who cannot meet are common signs of a scam.",
  },
  {
    title: "Keep personal details private",
    body: "Never share one-time passwords (OTP), card numbers or bank logins. SLMarket.lk will never ask you for them.",
  },
  {
    title: "Report anything suspicious",
    body: 'Use "Report this ad" on the ad page, or contact us. Reports are reviewed by our team.',
  },
];

export default function SafetyTipsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[color:var(--color-market-text)]">
        Safety tips
      </h1>
      <p className="mt-3 text-[color:var(--color-market-text-secondary)]">
        Most people on SLMarket.lk are genuine buyers and sellers. These habits
        keep you safe from the few who are not.
      </p>
      <ol className="mt-8 space-y-5">
        {TIPS.map((tip, i) => (
          <li key={tip.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold text-[color:var(--color-market-text)]">
                {tip.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-market-text-secondary)]">
                {tip.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-10 text-sm text-[color:var(--color-market-text-secondary)]">
        Something went wrong?{" "}
        <Link
          href="/help/complaints"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Report it to us
        </Link>
        .
      </p>
    </div>
  );
}
