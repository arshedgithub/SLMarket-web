"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";

interface UserSettings {
  name: string;
  email: string;
  phone: string | null;
  locationCity: string | null;
  shopSlug: string | null;
  shopBio: string | null;
  whatsappNumber: string | null;
  specialties: string[];
  shopMetaTitle: string | null;
  shopMetaDescription: string | null;
}

interface Props {
  user: UserSettings;
  planName: string;
}

export default function SettingsForm({ user, planName }: Props) {
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? "",
    locationCity: user.locationCity ?? "",
    shopSlug: user.shopSlug ?? "",
    shopBio: user.shopBio ?? "",
    whatsappNumber: user.whatsappNumber ?? "",
    specialties: user.specialties.join(", "),
    shopMetaTitle: user.shopMetaTitle ?? "",
    shopMetaDescription: user.shopMetaDescription ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError("");
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/seller/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          specialties: form.specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const isDealer = planName === "dealer";

  return (
    <div className="space-y-6">
      {/* Basic info */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Basic Information
        </h2>

        {[
          { name: "name", label: "Full Name", placeholder: "Your full name" },
          { name: "phone", label: "Phone", placeholder: "+94 77 123 4567" },
          {
            name: "whatsappNumber",
            label: "WhatsApp Number",
            placeholder: "+94 77 123 4567",
          },
          { name: "locationCity", label: "City", placeholder: "Ratnapura" },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {f.label}
            </label>
            <input
              type="text"
              name={f.name}
              value={form[f.name as keyof typeof form] as string}
              onChange={handleChange}
              placeholder={f.placeholder}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </section>

      {/* Shop profile */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Shop Profile
        </h2>
        {!["basic", "pro", "dealer"].includes(planName) && (
          <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            Upgrade to Basic or above to get a public shop profile page.
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Shop URL slug
          </label>
          <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            <span className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm border-r border-gray-300 dark:border-gray-700">
              slmarket.lk/business/
            </span>
            <input
              type="text"
              name="shopSlug"
              value={form.shopSlug}
              onChange={handleChange}
              placeholder="your-shop-name"
              className="flex-1 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Shop Bio
          </label>
          <textarea
            name="shopBio"
            value={form.shopBio}
            onChange={handleChange}
            rows={3}
            placeholder="Tell buyers about your shop, expertise, and what makes your gems special..."
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Specialties (comma-separated)
          </label>
          <input
            type="text"
            name="specialties"
            value={form.specialties}
            onChange={handleChange}
            placeholder="Ceylon Sapphire, Ruby, Gem Certification"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* SEO — Dealer only */}
      {isDealer && (
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Custom SEO
            <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Dealer
            </span>
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Shop page title ({form.shopMetaTitle.length}/60)
            </label>
            <input
              type="text"
              name="shopMetaTitle"
              value={form.shopMetaTitle}
              onChange={handleChange}
              maxLength={60}
              placeholder="Your Business Name: Electronics & Accessories | SLMarket.lk"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Shop page description ({form.shopMetaDescription.length}/155)
            </label>
            <textarea
              name="shopMetaDescription"
              value={form.shopMetaDescription}
              onChange={handleChange}
              maxLength={155}
              rows={2}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </section>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">Settings saved!</p>}

      <button
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Save Changes
      </button>
    </div>
  );
}
