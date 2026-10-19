import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SettingsForm from "./_components/SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      district: true,
      businessProfiles: {
        where: { status: { not: "DISABLED" } },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          subscription: {
            select: {
              status: true,
              currentPeriodEnd: true,
              plan: { select: { displayName: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>
      <SettingsForm
        user={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          district: user.district,
        }}
        businesses={user.businessProfiles.map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          suspended: b.status === "SUSPENDED",
          planName:
            b.subscription?.status === "ACTIVE"
              ? b.subscription.plan.displayName
              : null,
          planEnds:
            b.subscription?.status === "ACTIVE"
              ? b.subscription.currentPeriodEnd.toISOString()
              : null,
        }))}
      />
    </div>
  );
}
