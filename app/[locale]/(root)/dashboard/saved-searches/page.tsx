import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SavedSearchList } from "./SavedSearchList";

export const metadata = { title: "Saved searches" };

export default async function SavedSearchesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const searches = await db.savedSearch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, label: true, query: true, alerts: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Saved searches
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          With alerts on, we email you once a day when new ads match.
        </p>
      </div>
      <SavedSearchList initial={searches} />
    </div>
  );
}
