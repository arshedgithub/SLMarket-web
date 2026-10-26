import type { Metadata } from "next";
import {
  DirectoryPage,
  buildDirectoryMetadata,
} from "./_components/directoryPage";

// Cached for a minute: many visitors see the same page. Personal parts
// (saved state, distances from GPS) load afterwards in the browser.
export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildDirectoryMetadata(locale, { kind: "root" });
}

export default async function BusinessesPage({ params }: Props) {
  const { locale } = await params;
  return <DirectoryPage locale={locale} route={{ kind: "root" }} />;
}
