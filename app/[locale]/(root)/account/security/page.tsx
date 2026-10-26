import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Metadata } from "next";
import { SessionsPanel } from "@/components/account/SessionsPanel";

export const metadata: Metadata = {
  title: "Account Security | SLMarket.lk",
  description: "Manage your active sessions and signed-in devices.",
};

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/account/security");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <SessionsPanel />
      </div>
    </div>
  );
}
