import type { Metadata } from "next";
import {
  DirectoryPage,
  buildDirectoryMetadata,
} from "../../_components/directoryPage";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string; category: string; segment: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category, segment } = await params;
  return buildDirectoryMetadata(locale, { kind: "segment", category, segment });
}

export default async function BusinessSegmentPage({ params }: Props) {
  const { locale, category, segment } = await params;
  return (
    <DirectoryPage
      locale={locale}
      route={{ kind: "segment", category, segment }}
    />
  );
}
