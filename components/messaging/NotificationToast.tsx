"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useMessagingStore } from "@/store/messagingStore";
import { getNotificationIcon } from "@/lib/messaging/notification-ui";
import type { NotificationType } from "@/lib/messaging/types";

const AUTO_DISMISS_MS = 5000;

function Toast({
  id,
  type,
  title,
  body,
  link,
  count,
}: {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  count: number;
}) {
  const dismissToast = useMessagingStore((s) => s.dismissToast);
  const [visible, setVisible] = useState(false);
  const Icon = getNotificationIcon(type);

  useEffect(() => {
    const enter = setTimeout(() => setVisible(true), 10);
    const timer = setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
    return () => {
      clearTimeout(enter);
      clearTimeout(timer);
    };
  }, [id, dismissToast]);

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-2xl transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <Link
        href={link}
        onClick={() => dismissToast(id)}
        className="min-w-0 flex-1"
      >
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-text">{title}</p>
          {count > 1 && (
            <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
              {count}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-light-text">{body}</p>
      </Link>
      <button
        onClick={() => dismissToast(id)}
        className="text-light-text hover:text-text"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function NotificationToast() {
  const toasts = useMessagingStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={`${toast.id}:${toast.count}`}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          body={toast.body}
          link={toast.link}
          count={toast.count}
        />
      ))}
    </div>
  );
}
