"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useThemeStore } from "@/store/themeStore";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqPage() {
  const { isDarkMode } = useThemeStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems: FaqItem[] = [
    {
      question: "What is SLMarket.lk?",
      answer:
        "SLMarket.lk is Sri Lanka's online marketplace for vehicles, property, electronics, fashion, jobs, services and everyday essentials. We connect local buyers and sellers so you can browse, list, and trade with confidence.",
    },
    {
      question: "How do I contact a seller about a listing?",
      answer:
        "Open the listing you're interested in and use the message or call button on the page to reach the seller directly. Our support team is also available if you need help.",
    },
    {
      question: "Do I need a business account to sell on SLMarket.lk?",
      answer:
        "No. Any registered account can post listings straight away. Creating a business profile is optional, and gives your business a dedicated page and verification badge for its listings.",
    },
    {
      question: "Is every listing checked before it goes live?",
      answer:
        "Yes. Every new listing is reviewed before it appears on the site, which helps keep the marketplace free of spam and scams.",
    },
    {
      question: "How do I list an item for sale?",
      answer:
        "Sign in, then use the 'Post Ad' button to submit details about what you're selling, including photos, a description, and your price. Once submitted, your listing is reviewed before it goes live.",
    },
    {
      question: "Does SLMarket.lk handle delivery or shipping of items?",
      answer:
        "No. SLMarket.lk is a marketplace that connects buyers and sellers. We do not handle delivery, shipping, or courier services ourselves. Buyers and sellers arrange collection or delivery directly with each other once a deal is agreed.",
    },
    {
      question: "How do payments and business subscriptions work?",
      answer:
        "Business subscription plans and platform fees are processed securely through PayHere. Payments for individual items are arranged directly between buyers and sellers, and we recommend agreeing on terms before completing any transaction.",
    },
    {
      question:
        "What should I do if I have a problem with a seller or listing?",
      answer:
        "If you experience an issue with a seller, a listing, or suspect fraudulent activity, please use the Complaints page to report the issue. Our team will review the report and follow up with you.",
    },
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // FAQPage structured data — makes these questions eligible for Google's
  // FAQ rich result. Client component, but Next.js still server-renders it
  // on first load, so this script tag is present in the HTML crawlers see.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <h1
        className={`text-3xl font-bold mb-6 ${isDarkMode ? "text-white" : ""}`}
      >
        Frequently Asked Questions
      </h1>

      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className={`rounded-lg overflow-hidden ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
          >
            <button
              className={`flex justify-between items-center w-full p-4 text-left font-medium ${isDarkMode ? "text-white hover:bg-gray-600" : "hover:bg-gray-50"}`}
              onClick={() => toggleItem(index)}
            >
              <span>{item.question}</span>
              <svg
                className={`w-5 h-5 transition-transform ${openIndex === index ? "transform rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openIndex === index && (
              <div
                className={`p-4 border-t ${isDarkMode ? "border-gray-600 text-gray-300" : "border-gray-200 text-gray-600"}`}
              >
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className={`mt-8 p-6 rounded-lg ${isDarkMode ? "bg-gray-700 text-white" : "bg-white"} shadow-md`}
      >
        <h2 className="text-xl font-semibold mb-4">
          Didn&apos;t Find Your Answer?
        </h2>
        <p className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          If you couldn&apos;t find the information you&apos;re looking for,
          please reach out to our customer service team.
        </p>
        <Link
          href="/help/contact"
          className={`inline-block px-6 py-2 ${isDarkMode ? "bg-blue-600" : "bg-blue-500"} text-white rounded-md hover:bg-blue-600 transition-colors`}
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
