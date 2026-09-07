import { useState, useEffect, useCallback } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { checkinService } from "../../services/checkinService";
import Badge from "../../components/common/Badge";

export default function MySessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await checkinService.list({ page, limit: 20, status });
      setSessions(result.checkIns || []);
      setPagination(result.pagination || null);
    } catch (err) {
      setError(err.message || "Couldn't load your sessions.");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  function handleStatusChange(event) {
    setStatus(event.target.value);
    setPage(1);
  }

  function formatDuration(checkedInAt, checkedOutAt) {
    if (!checkedOutAt) return "In progress";
    const ms = new Date(checkedOutAt) - new Date(checkedInAt);
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.round((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  if (loading)
    return <p className="text-sm text-slate-400">Loading your sessions...</p>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-[var(--color-primary)]">
            My Sessions
          </h1>
          <select
            value={status}
            onChange={handleStatusChange}
            aria-label="Filter sessions by status"
            className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-primary)] focus:border-[var(--color-accent)] focus:outline-none"
          >
            <option value="">All statuses</option>
            <option value="CHECKED_IN">Checked in</option>
            <option value="CHECKED_OUT">Checked out</option>
          </select>
        </div>
        <p className="text-sm text-slate-500">
          Every past and active check-in, across all your bookings.
        </p>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {sessions.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-16 text-center">
          <Clock size={28} className="text-slate-300" />
          <p className="text-sm text-slate-500">
            No sessions yet — check in at a branch to see it here.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] p-4 last:border-b-0"
          >
            <div>
              <p className="font-medium text-[var(--color-primary)]">
                {session.bookingDate?.booking?.workstation?.name ||
                  "Workstation"}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(session.bookingDate?.bookingDate).toLocaleDateString(
                  undefined,
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  },
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono-tight text-xs text-slate-500">
                {formatDuration(session.checkedInAt, session.checkedOutAt)}
              </span>
              <Badge status={session.status} />
            </div>
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPage((currentPage) => currentPage - 1)}
              disabled={!pagination.hasPreviousPage || loading}
              className="rounded-lg border border-[var(--color-line)] p-2 text-[var(--color-primary)] disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="Next page"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="rounded-lg border border-[var(--color-line)] p-2 text-[var(--color-primary)] disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
