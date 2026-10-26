"use client";

import React from "react";
import { useThemeStore } from "@/store/themeStore";

export default function ComplaintsPage() {
  const { isDarkMode } = useThemeStore();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1
        className={`text-3xl font-bold mb-6 ${isDarkMode ? "text-white" : ""}`}
      >
        File a Complaint
      </h1>

      <div
        className={`rounded-lg p-6 mb-8 ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          We Value Your Feedback
        </h2>
        <p className={`mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          We&apos;re sorry to hear you&apos;ve had a negative experience. Please
          share the details of your complaint below, and our customer service
          team will address your concerns promptly.
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
              htmlFor="listing-id"
              className={`block mb-1 font-medium ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Ad ID or Seller Name (if applicable)
            </label>
            <input
              type="text"
              id="listing-id"
              className={`w-full px-4 py-2 border rounded-md ${isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "border-gray-300"}`}
              placeholder="e.g., Ad #1234 or seller's name"
            />
          </div>

          <div>
            <label
              htmlFor="complaint-type"
              className={`block mb-1 font-medium ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Complaint Type
            </label>
            <select
              id="complaint-type"
              className={`w-full px-4 py-2 border rounded-md ${isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "border-gray-300"}`}
            >
              <option>Listing Accuracy / Item Description</option>
              <option>Seller Conduct or Dispute</option>
              <option>Authenticity or Certification Concern</option>
              <option>Billing & Subscription Payment</option>
              <option>Website Issues</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="details"
              className={`block mb-1 font-medium ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Complaint Details
            </label>
            <textarea
              id="details"
              rows={5}
              className={`w-full px-4 py-2 border rounded-md ${isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "border-gray-300"}`}
              placeholder="Please provide as much detail as possible about your complaint"
            ></textarea>
          </div>

          <div>
            <label
              className={`block mb-3 font-medium ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Supporting Documents (optional)
            </label>
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center ${isDarkMode ? "border-gray-600 text-gray-300" : "border-gray-300 text-gray-500"}`}
            >
              <svg
                className="mx-auto h-12 w-12"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-1">
                Drag and drop files here, or click to select files
              </p>
              <p className="mt-1 text-sm">(Max 5 files, 10MB each)</p>
              <input type="file" className="hidden" multiple />
            </div>
          </div>

          <button
            type="submit"
            className={`px-6 py-2 ${isDarkMode ? "bg-blue-600" : "bg-blue-500"} text-white rounded-md hover:bg-blue-600 transition-colors`}
          >
            Submit Complaint
          </button>
        </form>
      </div>

      <div
        className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          What to Expect
        </h2>
        <ol
          className={`list-decimal list-inside space-y-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          <li>
            You&apos;ll receive a confirmation email with your complaint
            reference number within 24 hours.
          </li>
          <li>
            A customer service representative will review your complaint within
            1-2 business days.
          </li>
          <li>We may contact you for additional information if needed.</li>
          <li>
            We aim to resolve all complaints within 5 business days, although
            complex issues may take longer.
          </li>
          <li>
            You&apos;ll receive regular updates throughout the resolution
            process.
          </li>
        </ol>
      </div>
    </div>
  );
}
