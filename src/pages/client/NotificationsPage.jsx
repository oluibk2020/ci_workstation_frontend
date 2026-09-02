import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { notificationService } from "../../services/notificationService";
import Button from "../../components/common/Button";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await notificationService.list();
      setNotifications(result.notifications || []);
    } catch (err) {
      setError(err.message || "Couldn't load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMarkRead(id) {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
        ),
      );
    } catch {
      // non-critical — leave it unread visually if this fails
    }
  }

  async function handleMarkAllRead() {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readAt: n.readAt || new Date().toISOString(),
        })),
      );
    } catch {
      // non-critical
    }
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  if (loading)
    return <p className="text-sm text-slate-400">Loading notifications...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">
            Notifications
          </h1>
          <p className="text-sm text-slate-500">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck size={14} />
            Mark all as read
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {notifications.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-16 text-center">
          <Bell size={28} className="text-slate-300" />
          <p className="text-sm text-slate-500">Nothing yet.</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.readAt && handleMarkRead(n.id)}
            className={`block w-full border-b border-[var(--color-line)] p-4 text-left last:border-b-0 ${
              n.readAt ? "bg-white" : "bg-[var(--color-accent)]/5"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary)]">
                  {n.title}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
              </div>
              {!n.readAt && (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
