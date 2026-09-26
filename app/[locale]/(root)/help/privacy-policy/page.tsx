"use client";

import React from "react";
import { useThemeStore } from "@/store/themeStore";

export default function PrivacyPolicyPage() {
  const { isDarkMode } = useThemeStore();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1
        className={`text-3xl font-bold mb-6 ${isDarkMode ? "text-white" : ""}`}
      >
        Privacy Policy
      </h1>

      <div
        className={`rounded-lg p-6 ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
      >
        <p
          className={`mb-6 italic ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Last Updated: June 15, 2026
        </p>

        <div className="space-y-8">
          <section>
            <h2
              className={`text-xl font-semibold mb-3 ${isDarkMode ? "text-white" : ""}`}
            >
              1. Introduction
            </h2>
            <p
              className={`mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              This Privacy Policy explains how SLMarket.lk collects, uses,
              discloses, and safeguards your information when you visit our
              marketplace or use our services to buy, sell, or browse listings.
              Please read this privacy policy carefully. If you do not agree
              with the terms of this privacy policy, please do not access the
              site.
            </p>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              We reserve the right to make changes to this Privacy Policy at any
              time and for any reason. We will alert you about any changes by
              updating the &quot;Last Updated&quot; date of this Privacy Policy.
              You are encouraged to periodically review this Privacy Policy to
              stay informed of updates.
            </p>
          </section>

          <section>
            <h2
              className={`text-xl font-semibold mb-3 ${isDarkMode ? "text-white" : ""}`}
            >
              2. Information We Collect
            </h2>

            <h3
              className={`text-lg font-medium mb-2 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Personal Data
            </h3>
            <p
              className={`mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Personally identifiable information, such as your name, billing or
              business address, email address, and telephone number, that you
              voluntarily give to us when you register with the Site or when you
              choose to participate in various activities related to the Site,
              such as creating listings, contacting sellers, or subscribing to a
              seller plan.
            </p>

            <h3
              className={`text-lg font-medium mb-2 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Derivative Data
            </h3>
            <p
              className={`mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Information our servers automatically collect when you access the
              Site, such as your IP address, your browser type, your operating
              system, your access times, and the pages you have viewed directly
              before and after accessing the Site.
            </p>

            <h3
              className={`text-lg font-medium mb-2 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Financial Data
            </h3>
            <p
              className={`mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Financial information, such as data related to your payment
              method, that we may collect when you subscribe to a seller plan or
              pay platform fees through our payment processors, Stripe and
              PayHere. We do not store full card numbers on our servers.
            </p>

            <h3
              className={`text-lg font-medium mb-2 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Mobile Device Data
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Device information such as your mobile device ID, model, and
              manufacturer, and information about the device&apos;s operating
              system, that we may collect automatically when you access the Site
              from a mobile device.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
