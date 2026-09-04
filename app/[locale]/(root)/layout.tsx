import { Layout } from "@/components";
import { getMegaMenuAds } from "@/lib/getMegaMenuAds";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const megaMenuAds = await getMegaMenuAds();
  return <Layout megaMenuAds={megaMenuAds}>{children}</Layout>;
}
