"use client";

import Link from "next/link";
import React from "react";
import { colors } from "@/lib/theme/colors";

interface CustomerServiceLayoutProps {
  children: React.ReactNode;
}

export default function CustomerServiceLayout({
  children,
}: CustomerServiceLayoutProps) {
  const sidebarLinks = [
    { href: "/help/contact", label: "Contact Us" },
    { href: "/help/faq", label: "FAQ" },
    { href: "/help/complaints", label: "Complaints" },
    { href: "/help/privacy-policy", label: "Privacy Policy" },
  ];

  return (
    <div className="flex flex-col md:flex-row w-full">
      <aside className="md:w-64 flex-shrink-0 p-4 bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-700 border-gray-200">
        <h2
          className={`text-lg font-semibold mb-4 text-${colors.neutral.text} dark:text-white`}
        >
          Help Center
        </h2>
        <nav>
          <ul className="space-y-2">
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block px-3 py-2 rounded-md transition-colors text-${colors.neutral.text} hover:bg-${colors.primary.light} hover:text-white dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main
        className={`flex-grow p-6 bg-${colors.neutral.background} text-${colors.neutral.text} dark:bg-gray-800 dark:text-gray-200`}
      >
        {children}
      </main>
    </div>
  );
}
