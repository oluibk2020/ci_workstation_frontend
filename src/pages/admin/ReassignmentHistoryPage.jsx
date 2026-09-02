import { useState, useEffect, useCallback } from "react";
import { RefreshCcw } from "lucide-react";
import { bookingService } from "../../services/bookingService";

/**
 * A history/audit log, NOT a "requests" queue — reassignment is
 * self-service in this system (the booker calls this directly), so
 * there's nothing for Staff/Admin to approve. This shows every
 * reassignment that's already happened, for visibility. Shared by
 * /staff/reassignments and /admin/reassignments.
 */
export default function ReassignmentHistoryPage() {
  const [reassignments, setReassignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await bookingService.getReassignmentHistory();
      setReassignments(result.reassignments || []);
    } catch (err) {
      setError(err.message || "Couldn't load reassignment history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-sm text-slate-400">Loading reassignment history...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Reassignment History</h1>
        <p className="text-sm text-slate-500">
          Reassignment is self-service — clients move their own dates directly, up to 3 times a
          month. This is a log of what's happened, not a queue to approve.
        </p>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {reassignments.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-16 text-center">
          <RefreshCcw size={28} className="text-slate-300" />
          <p className="text-sm text-slate-500">No reassignments yet.</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
        {reassignments.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] p-4 last:border-b-0">
            <div>
              <p className="font-medium text-[var(--color-primary)]">{r.requestedBy.name}</p>
              <p className="text-xs text-slate-400">
                {r.booking.workstation?.name} · {r.booking.branch?.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">
                {new Date(r.fromDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })} →{" "}
                {new Date(r.toDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </p>
              <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
