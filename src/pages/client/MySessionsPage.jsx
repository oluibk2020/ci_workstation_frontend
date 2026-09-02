import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import { bookingService } from "../../services/bookingService";
import Badge from "../../components/common/Badge";

/**
 * Deliberately not a new backend endpoint — GET /bookings already returns
 * each date's nested `checkIn` record. A "session" here is just a
 * BookingDate that has one, flattened across every booking and sorted
 * newest first.
 */
export default function MySessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await bookingService.list();
      const bookings = result.bookings || [];
      const flattened = bookings
        .flatMap((booking) =>
          (booking.dates || [])
            .filter((d) => d.checkIn)
            .map((d) => ({
              id: d.checkIn.id,
              date: d.bookingDate,
              status: d.checkIn.status,
              checkedInAt: d.checkIn.checkedInAt,
              checkedOutAt: d.checkIn.checkedOutAt,
              workstation: booking.workstation,
              branch: booking.branch,
              seat: booking.seat,
            })),
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setSessions(flattened);
    } catch (err) {
      setError(err.message || "Couldn't load your sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
        <h1 className="text-xl font-bold text-[var(--color-primary)]">
          My Sessions
        </h1>
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
        {sessions.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] p-4 last:border-b-0"
          >
            <div>
              <p className="font-medium text-[var(--color-primary)]">
                {s.workstation?.name} — Seat {s.seat?.seatId}
              </p>
              <p className="text-xs text-slate-400">
                {s.branch?.name} ·{" "}
                {new Date(s.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono-tight text-xs text-slate-500">
                {formatDuration(s.checkedInAt, s.checkedOutAt)}
              </span>
              <Badge status={s.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
