import { Layout } from "@/components";
import { getMegaMenuAds } from "@/lib/getMegaMenuAds";
import { getAdFeed } from "@/lib/listings/feed";
import { popularSearches } from "@/lib/listings/popularSearches";

export const revalidate = 60;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [megaMenuAds, ads] = await Promise.all([getMegaMenuAds(), getAdFeed()]);

  return (
    <Layout megaMenuAds={megaMenuAds} popularSearches={popularSearches(ads, 6)}>
      {children}
    </Layout>
  );
}
