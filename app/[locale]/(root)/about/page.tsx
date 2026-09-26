"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useThemeStore } from "@/store/themeStore";
import { SELL_CTA } from "@/lib/seller-cta";

export default function About() {
  const t = useTranslations("nav");
  const { isDarkMode } = useThemeStore();
  const sellerHref = SELL_CTA.href;
  const sellerLabel = t(SELL_CTA.labelKey);

  return (
    <div
      className={`max-w-4xl mx-auto px-4 sm:px-6 py-8 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
    >
      <section className="mb-12 text-center">
        <h1
          className={`text-4xl font-bold mb-6 ${isDarkMode ? "text-white" : ""}`}
        >
          About SLMarket.lk
        </h1>
        <p
          className={`text-xl mb-8 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          SLMarket.lk is Sri Lanka&apos;s trusted online marketplace for
          vehicles, property, electronics, fashion, jobs, services and everyday
          essentials, connecting buyers with sellers across the island, anytime.
        </p>
        <div className="relative w-full h-64 rounded-lg mb-8 overflow-hidden">
          <Image
            src="/images/hero-bg.webp"
            alt="SLMarket.lk marketplace"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      </section>

      <section className="mb-12">
        <h2
          className={`text-2xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          Our Story
        </h2>
        <div
          className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
        >
          <p className="mb-4">
            SLMarket.lk was founded to give Sri Lankans a single, trusted place
            to buy and sell almost anything, from vehicles and property to
            electronics, fashion, jobs and services, making it easier for buyers
            and sellers to connect, trade, and build trust.
          </p>
          <p className="mb-4">
            What started as an idea to bring local classifieds online has grown
            into a marketplace that brings together everyday sellers and growing
            businesses with buyers across every district of the island.
          </p>
          <p>
            Our team combines local market knowledge with online marketplace
            experience, and that shapes everything we do, from how listings are
            reviewed to the tools we build to help buyers shop with confidence.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2
          className={`text-2xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          Our Mission
        </h2>
        <div className={`grid md:grid-cols-3 gap-6`}>
          <div
            className={`p-5 rounded-lg text-center ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
          >
            <div
              className={`h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDarkMode ? "bg-blue-600" : "bg-blue-100"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${isDarkMode ? "text-white" : "text-blue-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : ""}`}
            >
              Connect
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Bringing together buyers and sellers across Sri Lanka in one
              transparent, easy-to-use marketplace.
            </p>
          </div>

          <div
            className={`p-5 rounded-lg text-center ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
          >
            <div
              className={`h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDarkMode ? "bg-blue-600" : "bg-blue-100"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${isDarkMode ? "text-white" : "text-blue-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : ""}`}
            >
              Verify
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Building trust through admin-reviewed listings and verified
              business profiles you can rely on.
            </p>
          </div>

          <div
            className={`p-5 rounded-lg text-center ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
          >
            <div
              className={`h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDarkMode ? "bg-blue-600" : "bg-blue-100"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${isDarkMode ? "text-white" : "text-blue-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : ""}`}
            >
              Educate
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Providing guides and support to help buyers and sellers make
              informed decisions, from pricing to safe meetups.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2
          className={`text-2xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          What We Offer
        </h2>
        <div
          className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
        >
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 mr-2 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-green-400" : "text-green-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <h3 className={`font-medium ${isDarkMode ? "text-white" : ""}`}>
                  Reviewed Listings
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  Every listing is reviewed before it goes live on SLMarket.lk,
                  and businesses can apply for a verified badge, so buyers know
                  who they&apos;re dealing with.
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 mr-2 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-green-400" : "text-green-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <h3 className={`font-medium ${isDarkMode ? "text-white" : ""}`}>
                  Wide Selection
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  From vehicles and property to electronics, fashion, food, jobs
                  and everyday services, all in one place.
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 mr-2 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-green-400" : "text-green-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <h3 className={`font-medium ${isDarkMode ? "text-white" : ""}`}>
                  Business Profiles
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  Growing sellers can set up a dedicated business profile with
                  its own page for all their listings.
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 mr-2 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-green-400" : "text-green-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <h3 className={`font-medium ${isDarkMode ? "text-white" : ""}`}>
                  Local Support
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  Guides and a local help centre to support you through buying
                  and selling safely.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2
          className={`text-2xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          Join Our Community
        </h2>
        <div
          className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md text-center`}
        >
          <p
            className={`mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            Whether you&apos;re looking to buy something specific, list your own
            items, or grow a business with a dedicated profile, we invite you to
            become part of our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className={`px-6 py-2 rounded-md ${isDarkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-600"} text-white transition-colors`}
            >
              Join Today
            </Link>
            <Link
              href={sellerHref}
              className={`px-6 py-2 rounded-md ${isDarkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"} ${isDarkMode ? "text-white" : "text-gray-800"} transition-colors`}
            >
              {sellerLabel}
            </Link>
            <Link
              href="/help/contact"
              className={`px-6 py-2 rounded-md ${isDarkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"} ${isDarkMode ? "text-white" : "text-gray-800"} transition-colors`}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
