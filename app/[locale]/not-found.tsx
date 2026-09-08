import Link from "next/link";
import { Home, Search, Car, Smartphone, Wrench, Store } from "lucide-react";
import { Layout } from "@/components";

export const metadata = { title: "Page Not Found" };

const popularCategories = [
  { href: "/vehicles", label: "Vehicles", icon: Car },
  { href: "/property", label: "Property", icon: Home },
  { href: "/electronics", label: "Electronics", icon: Smartphone },
  { href: "/services", label: "Services", icon: Wrench },
];

export default function NotFound() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
            <Store className="h-12 w-12 text-white" />
          </div>
        </div>

        <p className="text-7xl sm:text-8xl font-bold text-primary leading-none">
          404
        </p>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-text">
          This page has slipped through our fingers
        </h1>
        <p className="mt-3 text-light-text max-w-md mx-auto">
          The listing or page you&apos;re looking for may have been sold, moved,
          or never existed. Let&apos;s get you back to the good stuff.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Homepage
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-text hover:bg-background font-semibold transition-colors"
          >
            <Search className="h-4 w-4" />
            Browse Listings
          </Link>
        </div>

        <div className="mt-14">
          <p className="text-sm font-medium text-light-text mb-4">
            Or explore a category
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularCategories.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 px-4 py-5 rounded-xl border border-border bg-surface hover:border-primary-light hover:shadow-md transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-text">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
