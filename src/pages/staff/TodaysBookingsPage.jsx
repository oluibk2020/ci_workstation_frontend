import { useState, useEffect, useCallback } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { useCatalog } from "../../context/CatalogContext";
import { bookingService } from "../../services/bookingService";
import Badge from "../../components/common/Badge";

/**
 * Shared by Staff and Admin. Two tabs:
 * - "Today" (GET /bookings/today) — requires picking a branch, since a
 *   person could work across multiple branches and "today" is computed
 *   in each branch's own timezone on the backend.
 * - "All Bookings" (GET /bookings/admin/all) — "All users that booked
 *   should be seen" was requested directly. Every booking, across every
 *   user and branch, all time, paginated. New endpoint — previously the
 *   only booking-visibility views were "my own" and "today, one branch".
 */
export default function TodaysBookingsPage() {
  const { branches } = useCatalog();
  const [tab, setTab] = useState("today"); // "today" | "all"

  const [branchId, setBranchId] = useState("");
  const [todayData, setTodayData] = useState(null);
  const [todayLoading, setTodayLoading] = useState(false);
  const [todayError, setTodayError] = useState("");

  const [allBookings, setAllBookings] = useState([]);
  const [allPagination, setAllPagination] = useState(null);
  const [allPage, setAllPage] = useState(1);
  const [allLoading, setAllLoading] = useState(false);
  const [allError, setAllError] = useState("");

  const loadToday = useCallback(async (id) => {
    if (!id) return;
    setTodayLoading(true);
    setTodayError("");
    try {
      const result = await bookingService.getTodaysBookings(id);
      setTodayData(result);
    } catch (err) {
      setTodayError(err.message || "Couldn't load today's bookings.");
    } finally {
      setTodayLoading(false);
    }
  }, []);

  const loadAll = useCallback(async (page) => {
    setAllLoading(true);
    setAllError("");
    try {
      const result = await bookingService.getAllBookingsAdmin({
        page,
        limit: 20,
      });
      setAllBookings(result.bookings || []);
      setAllPagination(result.pagination);
    } catch (err) {
      setAllError(err.message || "Couldn't load all bookings.");
    } finally {
      setAllLoading(false);
    }
  }, []);

  useEffect(() => {
    if (branches.length > 0 && !branchId) {
      setBranchId(branches[0].id);
    }
  }, [branches, branchId]);

  useEffect(() => {
    if (tab === "today") loadToday(branchId);
  }, [tab, branchId, loadToday]);

  useEffect(() => {
    if (tab === "all") loadAll(allPage);
  }, [tab, allPage, loadAll]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">
          Bookings
        </h1>
        <p className="text-sm text-slate-500">
          {tab === "today"
            ? "Everyone expected at a branch today, without scanning one by one."
            : "Every booking, across every client and branch, all time."}
        </p>
      </div>

      <div className="flex gap-2">
        {[
          { key: "today", label: "Today" },
          { key: "all", label: "All Bookings" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-[var(--color-primary)] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "today" ? (
        <>
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

          {todayError && (
            <p className="text-sm text-[var(--color-danger)]">{todayError}</p>
          )}
          {todayLoading && <p className="text-sm text-slate-400">Loading...</p>}

          {todayData && !todayLoading && (
            <>
              <p className="text-sm text-slate-500">
                {todayData.date} · {todayData.bookings.length} booking
                {todayData.bookings.length === 1 ? "" : "s"} at{" "}
                {todayData.branch.name}
              </p>

              {todayData.bookings.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-16 text-center">
                  <CalendarDays size={28} className="text-slate-300" />
                  <p className="text-sm text-slate-500">
                    Nothing booked here today.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
                  {todayData.bookings.map((d) => (
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
        </>
      ) : (
        <>
          {allError && (
            <p className="text-sm text-[var(--color-danger)]">{allError}</p>
          )}

          {allLoading ? (
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </p>
          ) : allBookings.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-16 text-center">
              <CalendarDays size={28} className="text-slate-300" />
              <p className="text-sm text-slate-500">No bookings yet.</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
                {allBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] p-4 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-[var(--color-primary)]">
                        {b.beneficiary.name} — {b.seat.seatId}
                      </p>
                      <p className="text-xs text-slate-400">
                        {b.workstation.name} · {b.branch.name}
                        {b.bookedBy.id !== b.beneficiary.id &&
                          ` · Gifted by ${b.bookedBy.name}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {b.dates.length} day{b.dates.length === 1 ? "" : "s"} ·
                        ₦{Number(b.totalAmount).toLocaleString()} ·{" "}
                        {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge status={b.status} />
                  </div>
                ))}
              </div>

              {allPagination && allPagination.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>
                    Page {allPagination.page} of {allPagination.totalPages} ·{" "}
                    {allPagination.total} total
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAllPage((p) => Math.max(1, p - 1))}
                      disabled={allPagination.page <= 1}
                      className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setAllPage((p) => p + 1)}
                      disabled={allPagination.page >= allPagination.totalPages}
                      className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
