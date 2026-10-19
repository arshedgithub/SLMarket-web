"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  LogOut,
  Clock,
  MapPin,
  Shield,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface SessionRecord {
  id: string;
  sessionId: string;
  deviceName: string | null;
  deviceType: string | null;
  ip: string | null;
  lastSeenAt: string;
  createdAt: string;
}

function DeviceIcon({ type }: { type: string | null }) {
  const cls = "w-5 h-5";
  if (type === "mobile") return <Smartphone className={cls} />;
  if (type === "tablet") return <Tablet className={cls} />;
  return <Monitor className={cls} />;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function SessionsPanel() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [error, setError] = useState("");

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/sessions");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSessions(data.sessions);
      setCurrentSessionId(data.currentSessionId ?? null);
    } catch {
      setError("Failed to load sessions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revokeOne = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const res = await fetch(`/api/user/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    } catch {
      setError("Failed to sign out that device. Try again.");
    } finally {
      setRevoking(null);
    }
  };

  const revokeAll = async () => {
    setRevokingAll(true);
    try {
      const res = await fetch("/api/user/sessions", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSessions((prev) =>
        prev.filter((s) => s.sessionId === currentSessionId),
      );
    } catch {
      setError("Failed to sign out other devices. Try again.");
    } finally {
      setRevokingAll(false);
    }
  };

  const otherCount = sessions.filter(
    (s) => s.sessionId !== currentSessionId,
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            Active Sessions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Devices currently signed in to your account. You can force sign out
            any session you don&apos;t recognise.
          </p>
        </div>
        {otherCount > 0 && (
          <button
            onClick={revokeAll}
            disabled={revokingAll}
            className="shrink-0 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
          >
            {revokingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Sign out all other devices
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-center py-12 text-sm text-gray-400">
          No active sessions found.
        </p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const isCurrent = s.sessionId === currentSessionId;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                  isCurrent
                    ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                }`}
              >
                {/* Device icon */}
                <div
                  className={`shrink-0 rounded-full p-2.5 ${
                    isCurrent
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  <DeviceIcon type={s.deviceType} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {s.deviceName ?? "Unknown Device"}
                    </p>
                    {isCurrent && (
                      <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wide">
                        This device
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                    {s.ip && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" /> {s.ip}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" /> Last seen{" "}
                      {timeAgo(s.lastSeenAt)}
                    </span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">
                      Signed in {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Sign out button (not for current device) */}
                {!isCurrent && (
                  <button
                    onClick={() => revokeOne(s.sessionId)}
                    disabled={revoking === s.sessionId}
                    className="shrink-0 flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-red-300 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    {revoking === s.sessionId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogOut className="w-3.5 h-3.5" />
                    )}
                    Sign out
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
