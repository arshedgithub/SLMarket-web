import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Store } from "lucide-react";
import { Link } from "@/i18n/navigation";

export const metadata = {
  title: "Create a Business Profile",
  description:
    "Give buyers a dedicated page for your listings, with verification and priority placement.",
};

// Business profile creation isn't built yet — every account can already
// post listings without one. This is a clear placeholder rather than a
// dead link or the old (schema-incompatible) seller-registration wizard.
export default async function NewBusinessPage() {
  const session = await auth();
  if (!session) redirect("/login?next=/business/new");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950">
        <Store className="h-6 w-6" />
      </span>
      <h1 className="text-2xl font-bold text-[var(--color-market-text)]">
        Business profiles are coming soon
      </h1>
      <p className="text-sm text-[var(--color-market-text-secondary)]">
        You don&apos;t need one to sell — every account can already post
        listings. A business profile will give you a dedicated page,
        verification, and priority placement. We&apos;ll let you know when
        it&apos;s ready.
      </p>
      <Link
        href="/post-ad"
        className="btn-solid mt-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
      >
        Post a listing instead
      </Link>
    </div>
  );
}
