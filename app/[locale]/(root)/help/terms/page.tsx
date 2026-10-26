import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using SLMarket.lk: posting ads, buying and selling, business profiles, paid plans and what is not allowed.",
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Using SLMarket.lk",
    body: [
      "SLMarket.lk is a classifieds marketplace. We show ads posted by private sellers and businesses and help buyers contact them. We are not a party to any sale: the buyer and the seller agree the price, payment and handover between themselves.",
      "By using the site you agree to these terms. If you do not agree, please do not use SLMarket.lk.",
    ],
  },
  {
    title: "Your account",
    body: [
      "You need an account to post ads, save searches and message sellers. Keep your login details private; you are responsible for what happens under your account.",
      "Give accurate details. We may ask you to verify your phone number or email, and may suspend accounts that give false information.",
    ],
  },
  {
    title: "Posting ads",
    body: [
      "Ads must describe a real item, property, job or service that you are able to sell or offer, at the price shown, with your own photos or photos you have the right to use.",
      "Every ad is reviewed before it goes live. We may edit the category, reject, or remove an ad that breaks these terms or our listing policy, without notice.",
      "Ads stay live for the period of your plan and then expire. You can mark an ad as sold or remove it at any time from your dashboard.",
    ],
  },
  {
    title: "What is not allowed",
    body: [
      "Illegal items and services, stolen goods, weapons, drugs, counterfeit products, and anything that needs a licence you do not hold.",
      "Misleading ads, duplicate ads for the same item, fake prices, and ads that ask for payment in advance outside a known, safe method.",
      "Spam, harassment, and collecting other users' details for any purpose other than the sale.",
    ],
  },
  {
    title: "Buying safely",
    body: [
      "Check the item before you pay and never pay in advance. Read our safety tips before you meet a seller. We cannot guarantee any item, ad or user, and we are not responsible for losses from a sale between users.",
    ],
  },
  {
    title: "Business profiles and paid plans",
    body: [
      "Businesses can create a profile and buy plans and promotions (for example featured ads or spotlight placements). Prices and what each plan includes are shown before you pay.",
      "Paid placements are labelled as Featured, Premium or Sponsored. Payment is processed by our payment provider; plans renew only as described at checkout.",
      "A verified badge means we have checked the business's documents. It is not a guarantee of any individual sale.",
    ],
  },
  {
    title: "Content and privacy",
    body: [
      "You keep ownership of your ads and photos, and give SLMarket.lk permission to show, resize and share them to promote your ad on the site, the app and our social channels.",
      "How we handle personal data is explained in our privacy policy.",
    ],
  },
  {
    title: "Changes and contact",
    body: [
      "We may update these terms. When we do, we change the date at the top of this page; continuing to use the site means you accept the updated terms.",
      "Questions about these terms? Contact us and we will reply within 24 hours.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[color:var(--color-market-text)]">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-[color:var(--color-market-text-secondary)]">
        Last updated: 19 October 2026
      </p>
      <div className="mt-8 space-y-8">
        {SECTIONS.map((section, i) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold text-[color:var(--color-market-text)]">
              {i + 1}. {section.title}
            </h2>
            {section.body.map((p) => (
              <p
                key={p.slice(0, 40)}
                className="mt-2 leading-relaxed text-[color:var(--color-market-text-secondary)]"
              >
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
      <p className="mt-10 text-sm text-[color:var(--color-market-text-secondary)]">
        See also our{" "}
        <Link
          href="/help/privacy-policy"
          className="font-semibold text-blue-700 hover:underline dark:text-blue-300"
        >
          privacy policy
        </Link>
        ,{" "}
        <Link
          href="/help/safety"
          className="font-semibold text-blue-700 hover:underline dark:text-blue-300"
        >
          safety tips
        </Link>{" "}
        and{" "}
        <Link
          href="/help/contact"
          className="font-semibold text-blue-700 hover:underline dark:text-blue-300"
        >
          contact page
        </Link>
        .
      </p>
    </div>
  );
}
