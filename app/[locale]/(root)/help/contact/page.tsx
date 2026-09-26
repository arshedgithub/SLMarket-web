"use client";

import React from "react";
import { useThemeStore } from "@/store/themeStore";

export default function ContactPage() {
  const { isDarkMode } = useThemeStore();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1
        className={`text-3xl font-bold mb-6 ${isDarkMode ? "text-white" : ""}`}
      >
        Contact Customer Service
      </h1>

      <div
        className={`rounded-lg p-6 mb-8 ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          Get in Touch
        </h2>
        <p className="mb-6">
          We&apos;re here to help! Please fill out the form below and we&apos;ll
          get back to you as soon as possible.
        </p>

        <form className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className={`block mb-1 font-medium ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              className={`w-full px-4 py-2 border rounded-md ${isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "border-gray-300"}`}
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className={`block mb-1 font-medium ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`w-full px-4 py-2 border rounded-md ${isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "border-gray-300"}`}
              placeholder="Your email address"
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className={`block mb-1 font-medium ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Subject
            </label>
            <select
              id="subject"
              className={`w-full px-4 py-2 border rounded-md ${isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "border-gray-300"}`}
            >
              <option>General Inquiry</option>
              <option>Seller or Listing Question</option>
              <option>Account Issue</option>
              <option>Billing & Subscription</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="message"
              className={`block mb-1 font-medium ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              className={`w-full px-4 py-2 border rounded-md ${isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "border-gray-300"}`}
              placeholder="How can we help you?"
            ></textarea>
          </div>

          <button
            type="submit"
            className={`px-6 py-2 ${isDarkMode ? "bg-blue-600" : "bg-blue-500"} text-white rounded-md hover:bg-blue-600 transition-colors`}
          >
            Submit
          </button>
        </form>
      </div>

      <div
        className={`rounded-lg p-6 ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          Other Ways to Reach Us
        </h2>

        <div className="space-y-4">
          <div>
            <h3
              className={`font-medium mb-1 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Support Hotline
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              +94 11 234 5678 (Mon-Fri, 9am-5pm SLST)
            </p>
          </div>

          <div>
            <h3
              className={`font-medium mb-1 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Email
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              support@slmarket.lk
            </p>
          </div>

          <div>
            <h3
              className={`font-medium mb-1 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Office Address
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              SLMarket.lk HQ
              <br />
              Colombo, Sri Lanka
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
