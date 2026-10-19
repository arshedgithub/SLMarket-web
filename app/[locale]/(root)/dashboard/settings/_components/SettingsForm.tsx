"use client";

import { useState } from "react";
import { Save, Loader2, Store, ExternalLink, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SRI_LANKA_DISTRICTS } from "@/config/const/sriLankaLocations";

interface AccountSettings {
  name: string;
  email: string;
  phone: string | null;
  district: string | null;
}

interface BusinessSummary {
  id: string;
  name: string;
  slug: string;
  suspended: boolean;
  planName: string | null;
  planEnds: string | null;
}

const inputCls =
  "w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
const readOnlyCls =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400";

/*
 * Account details (name, district) plus the owner's business pages with
 * their plans. Email and phone are verified identities, shown but not
 * edited here; business details are on each business page.
 */
export default function SettingsForm({
  user,
  businesses,
}: {
  user: AccountSettings;
  businesses: BusinessSummary[];
}) {
  const [form, setForm] = useState({
    name: user.name,
    district: user.district ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSuccess(false);
    setError("");
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          data.message ?? "We couldn't save your settings. Please try again.",
        );
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't save your settings. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Your account
        </h2>

        <div>
          <label
            htmlFor="settings-name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Full name
          </label>
          <input
            id="settings-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label
            htmlFor="settings-district"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            District
          </label>
          <select
            id="settings-district"
            value={form.district}
            onChange={(e) => update("district", e.target.value)}
            className={inputCls}
          >
            <option value="">Not set</option>
            {SRI_LANKA_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Email
          </p>
          <p className={readOnlyCls}>{user.email}</p>
        </div>
        <div>
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Phone
          </p>
          <p className={readOnlyCls}>{user.phone ?? "Not added"}</p>
          <p className="mt-1 text-xs text-gray-500">
            Your email and phone are verified, so they can&apos;t be changed
            here. To change one, contact{" "}
            <Link
              href="/help/contact"
              className="font-medium text-blue-600 hover:underline"
            >
              support
            </Link>
            .
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg"
          >
            {error}
          </p>
        )}
        {success && (
          <p
            role="status"
            className="text-sm text-green-700 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-lg"
          >
            Settings saved.
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save settings
        </button>
      </section>

      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Your business pages
          </h2>
          <Link
            href="/business/new"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
          >
            <Plus className="w-4 h-4" />
            Create a business page
          </Link>
        </div>

        {businesses.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You don&apos;t have a business page yet. A business page gives your
            shop its own address on SLMarket.lk, with all its ads in one place.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {businesses.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Store className="h-5 w-5 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {b.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {b.suspended
                        ? "Suspended: contact support"
                        : b.planName
                          ? `${b.planName} plan until ${new Date(b.planEnds!).toLocaleDateString()}`
                          : "Free plan"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm font-semibold">
                  <Link
                    href={`/business/${b.slug}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    View page
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/dashboard/upgrade?business=${b.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {b.planName ? "Change plan" : "Upgrade"}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
