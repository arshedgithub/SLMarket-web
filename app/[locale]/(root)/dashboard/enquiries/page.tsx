import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils/date";
import { MessageSquare, ExternalLink, MessageCircle } from "lucide-react";

export const metadata = { title: "Enquiries" };

export default async function EnquiriesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const enquiries = await db.enquiry.findMany({
    where: { sellerId: session.user.id },
    include: {
      listing: {
        select: { id: true, title: true, slug: true, images: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  await db.enquiry.updateMany({
    where: { sellerId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Enquiries
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {enquiries.length} total enquiries from buyers
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No enquiries yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Enquiries from buyers will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {enquiry.buyerName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(enquiry.createdAt)} ago
                    </span>
                    {enquiry.buyerPhoneVerified && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2 truncate">
                    Re: {enquiry.listing.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {enquiry.message}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    {enquiry.conversationId && (
                      <Link
                        href={`/messages/${enquiry.conversationId}`}
                        className="flex items-center gap-1.5 text-blue-600 hover:underline font-medium"
                      >
                        <MessageCircle className="w-4 h-4" />
                        View Chat →
                      </Link>
                    )}
                    {enquiry.buyerPhone && (
                      <>
                        <a
                          href={`tel:${enquiry.buyerPhone}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          📞 {enquiry.buyerPhone}
                        </a>
                        {enquiry.buyerEmail && (
                          <a
                            href={`mailto:${enquiry.buyerEmail}`}
                            className="text-blue-600 hover:underline"
                          >
                            ✉ {enquiry.buyerEmail}
                          </a>
                        )}
                        <a
                          href={`https://wa.me/${enquiry.buyerPhone.replace(/\D/g, "")}?text=Hi ${enquiry.buyerName}, thank you for your enquiry on SLMarket.lk!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline"
                        >
                          WhatsApp →
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <Link
                  href={`/ad/${enquiry.listing.slug}`}
                  target="_blank"
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
