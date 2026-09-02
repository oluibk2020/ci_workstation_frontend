import { useState, useEffect, useCallback } from "react";
import { CalendarDays } from "lucide-react";
import { useCatalog } from "../../context/CatalogContext";
import { bookingService } from "../../services/bookingService";
import Badge from "../../components/common/Badge";

/**
 * Shared by Staff and Admin. New backend endpoint (GET /bookings/today) —
 * see docs/PATCH_NOTES.md. Requires picking a branch, since a person
 * could work across multiple branches and "today" is computed in each
 * branch's own timezone on the backend.
 */
export default function TodaysBookingsPage() {
  const { branches } = useCatalog();
  const [branchId, setBranchId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const result = await bookingService.getTodaysBookings(id);
      setData(result);
    } catch (err) {
      setError(err.message || "Couldn't load today's bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (branches.length > 0 && !branchId) {
      setBranchId(branches[0].id);
    }
  }, [branches, branchId]);

  useEffect(() => {
    load(branchId);
  }, [branchId, load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">
          Today's Bookings
        </h1>
        <p className="text-sm text-slate-500">
          Everyone expected at a branch today, without scanning one by one.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {branches.map((b) => (
          <button
            key={b.id}
            onClick={() => setBranchId(b.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              branchId === b.id
                ? "bg-[var(--color-primary)] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      {loading && <p className="text-sm text-slate-400">Loading...</p>}

      {data && !loading && (
        <>
          <p className="text-sm text-slate-500">
            {data.date} · {data.bookings.length} booking
            {data.bookings.length === 1 ? "" : "s"} at {data.branch.name}
          </p>

          {data.bookings.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-16 text-center">
              <CalendarDays size={28} className="text-slate-300" />
              <p className="text-sm text-slate-500">
                Nothing booked here today.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
              {data.bookings.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] p-4 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-[var(--color-primary)]">
                      {d.beneficiary.name} — Seat {d.seat.seatId}
                    </p>
                    <p className="text-xs text-slate-400">
                      {d.booking.workstation.name}
                      {d.booking.bookedBy.id !== d.beneficiaryUserId &&
                        ` · Gifted by ${d.booking.bookedBy.name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={d.beneficiary.verificationStatus}>
                      {d.beneficiary.verificationStatus}
                    </Badge>
                    {d.checkIn ? (
                      <Badge status={d.checkIn.status} />
                    ) : (
                      <span className="text-xs text-slate-400">
                        Not checked in
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
