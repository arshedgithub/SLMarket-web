import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Zap, Crown, Building2 } from "lucide-react";
import { DashboardShell } from "./_components/DashboardShell";
import { getSellerPlanName } from "@/lib/getSellerPlanName";

const planBadge: Record<
  string,
  { label: string; cls: string; Icon?: React.ElementType }
> = {
  free: { label: "Free", cls: "bg-gray-700 text-gray-300" },
  basic: { label: "Basic", cls: "bg-blue-900/70 text-blue-300", Icon: Zap },
  pro: { label: "Pro", cls: "bg-purple-900/70 text-purple-300", Icon: Crown },
  dealer: {
    label: "Dealer",
    cls: "bg-amber-900/70 text-amber-300",
    Icon: Building2,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const planName = await getSellerPlanName(session.user.id);
  const badge = planBadge[planName] ?? planBadge.free;
  const showUpgradeCta = planName === "free" || planName === "basic";
  const PlanIcon = badge.Icon;

  return (
    <div className="bg-gray-100 dark:bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto sm:px-4 sm:py-6">
        <div className="md:rounded-xl md:shadow-xl overflow-hidden">
          <DashboardShell
            badgeLabel={badge.label}
            badgeClassName={badge.cls}
            planIcon={
              PlanIcon && (
                <PlanIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              )
            }
            isVerified={session.user.isVerified}
            showUpgradeCta={showUpgradeCta}
            upgradeCtaLabel={
              planName === "free" ? "Upgrade to Basic" : "Go Pro"
            }
            upgradeCtaHint={
              planName === "free"
                ? "More listings + shop profile"
                : "Unlimited listings + analytics"
            }
          >
            {children}
          </DashboardShell>
        </div>
      </div>
    </div>
  );
}
