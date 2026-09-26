import { redirect } from "next/navigation";

// /businesses is the directory (plural); a single business page is
// singular, at /business/<slug>. Anyone who lands on /businesses/<slug>
// (the plural form with a slug) is sent to the real address.
export default async function BusinessesSlugRedirect({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  redirect(`/${locale}/business/${slug}`);
}
