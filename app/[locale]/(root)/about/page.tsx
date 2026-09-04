"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useThemeStore } from "@/store/themeStore";
import { useSellerCta } from "@/hooks/useSellerCta";

export default function About() {
  const t = useTranslations("nav");
  const { isDarkMode } = useThemeStore();
  const { href: sellerHref, labelKey: sellerLabelKey } = useSellerCta();
  const sellerLabel = t(sellerLabelKey);

  return (
    <div
      className={`max-w-4xl mx-auto px-4 sm:px-6 py-8 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
    >
      <section className="mb-12 text-center">
        <h1
          className={`text-4xl font-bold mb-6 ${isDarkMode ? "text-white" : ""}`}
        >
          About Lumevelo
        </h1>
        <p
          className={`text-xl mb-8 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Lumevelo is a global online marketplace for certified gems, precious
          metals, and fine jewellery, connecting buyers with verified sellers
          worldwide, anytime.
        </p>
        <div className="relative w-full h-64 rounded-lg mb-8 overflow-hidden">
          <Image
            src="/images/blue-sapphire-gemstone-free-png.webp"
            alt="Certified gemstones on Lumevelo"
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
            Lumevelo was founded to bring the centuries-old trade in gems,
            precious metals, and fine jewellery online, making it easier for
            buyers and sellers to connect, trade, and build trust in a single
            marketplace.
          </p>
          <p className="mb-4">
            What started as an idea to digitise the local gem trade has grown
            into a marketplace that brings together verified gem dealers,
            jewellers, and precious metal traders with buyers and collectors
            from around the world.
          </p>
          <p>
            Our team combines expertise in gemology, jewellery craftsmanship,
            and online marketplaces, and that knowledge shapes everything we do,
            from our seller verification process to the resources we provide to
            help buyers shop with confidence.
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
              Bringing together buyers and verified sellers of gems, precious
              metals, and jewellery in a transparent marketplace.
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
              Building trust through seller verification and encouraging
              certified, authenticated listings.
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
              Providing guides on gemstones, precious metals, and jewellery care
              to help buyers and sellers make informed decisions.
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
                  Verified Sellers
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  Gem dealers, jewellers, and precious metal traders go through
                  a verification process before they can list on Lumevelo, so
                  buyers know who they&apos;re dealing with.
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
                  From rare gemstones and precious metals to handcrafted
                  jewellery and related services such as certification,
                  valuation, and repair.
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
                  Certified & Authenticated Listings
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  Many sellers provide certification or grading reports from
                  recognised gemological laboratories alongside their listings.
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
                  Expert Resources & Guidance
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  Guides on gemstones, precious metals, and jewellery to help
                  you understand quality, value, and care.
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
            Whether you&apos;re looking to buy certified gems and jewellery,
            list your own items as a verified seller, or simply learn more about
            the trade, we invite you to become part of our growing community.
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
              href="/help-center/contact"
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
