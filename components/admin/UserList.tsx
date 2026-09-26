"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, BadgeCheck, ChevronDown } from "lucide-react";

interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  isVerified: boolean;
  createdAt: string;
  listingCount: number;
  planId: string | null;
  planName: string | null;
  planSlug: string;
}

interface PlanOption {
  id: string;
  name: string;
  displayName: string;
}

const PLAN_BADGE_CLASSES: Record<string, string> = {
  free: "bg-slate-100 text-slate-600",
  basic: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  dealer: "bg-amber-100 text-amber-800",
};

function planBadgeClass(slug: string) {
  return PLAN_BADGE_CLASSES[slug] ?? "bg-slate-100 text-slate-600";
}

const ROLE_FILTERS = ["ALL", "USER", "ADMIN"] as const;

const ROLE_FILTER_LABELS: Record<(typeof ROLE_FILTERS)[number], string> = {
  ALL: "All",
  USER: "Users",
  ADMIN: "Admins",
};

function roleBadgeClass(role: UserListItem["role"]) {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function UserList({
  users,
  plans,
}: {
  users: UserListItem[];
  plans: PlanOption[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<(typeof ROLE_FILTERS)[number]>("ALL");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    });
  }, [users, roleFilter, search]);

  const updatePlan = async (user: UserListItem, planId: string) => {
    setPendingId(user.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to update plan");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update plan");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1.5">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                roleFilter === r
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {ROLE_FILTER_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
          No users match your search.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Listings</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-900">
                        {u.name}
                      </span>
                      {u.isVerified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeClass(
                        u.role,
                      )}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {/* Plans attach to a BusinessProfile now, not a bare
                        User, so there's no per-user plan to edit here. */}
                    {false ? (
                      <div
                        className={`relative inline-flex items-center rounded-full font-medium text-xs ${planBadgeClass(
                          u.planSlug,
                        )} ${pendingId === u.id ? "opacity-50" : ""}`}
                      >
                        <select
                          value={u.planId ?? ""}
                          disabled={pendingId === u.id}
                          onChange={(e) => updatePlan(u, e.target.value)}
                          className="appearance-none bg-transparent pl-3 pr-6 py-1 text-xs font-medium focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                        >
                          <option value="" disabled>
                            {u.planName ?? "No plan"}
                          </option>
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.displayName}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-1.5 pointer-events-none" />
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.listingCount}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
