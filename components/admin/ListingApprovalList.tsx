"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  MessageSquareWarning,
  XCircle,
  Pencil,
  Trash2,
  Eye,
  Gem,
} from "lucide-react";

type ListingStatus =
  | "ACTIVE"
  | "SOLD"
  | "PAUSED"
  | "EXPIRED"
  | "PENDING_REVIEW"
  | "CHANGES_REQUESTED"
  | "REJECTED";

interface ListingItem {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  price: number;
  currency: string;
  status: ListingStatus;
  rejectionReason: string | null;
  createdAt: string;
  sellerName: string;
  sellerEmail: string;
  sellerPlan: string;
}

const STATUS_TABS: { label: string; value: ListingStatus | "ALL" }[] = [
  { label: "Pending", value: "PENDING_REVIEW" },
  { label: "Changes Requested", value: "CHANGES_REQUESTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Sold", value: "SOLD" },
  { label: "Expired", value: "EXPIRED" },
  { label: "All", value: "ALL" },
];

function statusBadgeClass(status: ListingStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "SOLD":
      return "bg-gray-100 text-gray-600";
    case "PENDING_REVIEW":
      return "bg-amber-100 text-amber-700";
    case "CHANGES_REQUESTED":
      return "bg-orange-100 text-orange-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function ListingApprovalList({
  listings,
  activeStatus,
}: {
  listings: ListingItem[];
  activeStatus: ListingStatus | "ALL";
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reasonModalFor, setReasonModalFor] = useState<ListingItem | null>(
    null,
  );
  const [reasonAction, setReasonAction] = useState<
    "request_changes" | "reject"
  >("request_changes");
  const [reason, setReason] = useState("");

  const approve = async (listing: ListingItem) => {
    setPendingId(listing.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to approve listing");
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve listing",
      );
    } finally {
      setPendingId(null);
    }
  };

  const submitReasonAction = async () => {
    if (!reasonModalFor || !reason.trim()) return;
    setPendingId(reasonModalFor.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/listings/${reasonModalFor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: reasonAction,
          reason: reason.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.message ??
            (reasonAction === "reject"
              ? "Failed to reject listing"
              : "Failed to request changes"),
        );
      }
      setReasonModalFor(null);
      setReason("");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : reasonAction === "reject"
            ? "Failed to reject listing"
            : "Failed to request changes",
      );
    } finally {
      setPendingId(null);
    }
  };

  const deleteListing = async (listing: ListingItem) => {
    if (!window.confirm(`Delete "${listing.title}"? This cannot be undone.`))
      return;
    setPendingId(listing.id);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to delete listing");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete listing");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/listings?status=${tab.value}`}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              activeStatus === tab.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
          No listings in this status.
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="w-14 h-14 shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                {listing.image ? (
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Gem className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {listing.title}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeClass(
                      listing.status,
                    )}`}
                  >
                    {listing.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm font-bold text-blue-600 mt-0.5">
                  {listing.currency} {listing.price.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {listing.sellerName} ({listing.sellerEmail}) ·{" "}
                  {listing.sellerPlan} ·{" "}
                  {new Date(listing.createdAt).toLocaleDateString()}
                </p>
                {listing.rejectionReason && (
                  <p className="text-xs text-orange-600 mt-1">
                    Reason: {listing.rejectionReason}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {listing.status === "ACTIVE" && (
                  <Link
                    href={`/ad/${listing.slug}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View listing"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  href={`/admin/listings/${listing.id}/edit`}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                {listing.status === "PENDING_REVIEW" && (
                  <>
                    <button
                      onClick={() => approve(listing)}
                      disabled={pendingId === listing.id}
                      title="Approve"
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setReasonAction("request_changes");
                        setReasonModalFor(listing);
                        setReason("");
                      }}
                      disabled={pendingId === listing.id}
                      title="Request changes"
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <MessageSquareWarning className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setReasonAction("reject");
                        setReasonModalFor(listing);
                        setReason("");
                      }}
                      disabled={pendingId === listing.id}
                      title="Reject"
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteListing(listing)}
                  disabled={pendingId === listing.id}
                  title="Delete"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {reasonModalFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md space-y-3">
            <h3 className="font-semibold text-gray-900">
              {reasonAction === "reject" ? "Reject" : "Request changes"}:{" "}
              {reasonModalFor.title}
            </h3>
            <p className="text-sm text-gray-500">
              {reasonAction === "reject"
                ? "This permanently rejects the listing. The seller will see this reason on their dashboard."
                : "This will be shown to the seller so they can fix and resubmit the listing."}
            </p>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder={
                reasonAction === "reject"
                  ? "e.g. This item violates our prohibited materials policy."
                  : "e.g. Please add at least 3 clear photos and your gem certificate."
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setReasonModalFor(null);
                  setReason("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReasonAction}
                disabled={!reason.trim() || pendingId === reasonModalFor.id}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                  reasonAction === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {reasonAction === "reject"
                  ? "Reject listing"
                  : "Send to seller"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
