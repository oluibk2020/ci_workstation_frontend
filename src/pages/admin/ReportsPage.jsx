import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import { useCatalog } from "../../context/CatalogContext";
import { reportService } from "../../services/reportService";
import { todayISO, addDaysISO } from "../../utils/businessDate";

/**
 * Revenue definition, please note: gross revenue = sum of BOOKING_DEBIT
 * wallet transactions in the selected range; net revenue subtracts
 * BOOKING_CANCELLATION_CREDIT transactions in the same range. This counts
 * revenue at the moment a booking is paid for, not when the booked date
 * actually happens — a reasonable default, not the only defensible one.
 * See docs/PATCH_NOTES.md for the full reasoning.
 */
export default function ReportsPage() {
  const { branches } = useCatalog();
  const [startDate, setStartDate] = useState(addDaysISO(todayISO(), -6));
  const [endDate, setEndDate] = useState(todayISO());
  const [branchId, setBranchId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await reportService.getSummary({ startDate, endDate, branchId: branchId || undefined });
      setSummary(result);
    } catch (err) {
      setError(err.message || "Couldn't load the report.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, branchId]);

  useEffect(() => {
    load();
  }, [load]);

  function setToday() {
    setStartDate(todayISO());
    setEndDate(todayISO());
  }

  function setLast7Days() {
    setStartDate(addDaysISO(todayISO(), -6));
    setEndDate(todayISO());
  }

  function setThisMonth() {
    const now = new Date();
    setStartDate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10));
    setEndDate(todayISO());
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Reports</h1>
        <p className="text-sm text-slate-500">Revenue and booking activity for a date range.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[var(--color-line)] bg-white p-4">
        <div>
          <label className="text-xs font-medium text-slate-500">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Branch</label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="mt-1 block rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          >
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={setToday}>Today</Button>
          <Button variant="outline" size="sm" onClick={setLast7Days}>Last 7 days</Button>
          <Button variant="outline" size="sm" onClick={setThisMonth}>This month</Button>
        </div>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading report...
        </p>
      ) : summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Net revenue" value={`₦${summary.netRevenue.toLocaleString()}`} tone="accent" />
            <StatCard label="Gross revenue" value={`₦${summary.grossRevenue.toLocaleString()}`} />
            <StatCard label="Cancelled value" value={`₦${summary.cancelledValue.toLocaleString()}`} tone="warning" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Bookings made" value={summary.bookingsCount} />
            <StatCard label="Dates cancelled" value={summary.cancelledDatesCount} />
            <StatCard label="Avg. days / booking" value={summary.avgDaysPerBooking} />
          </div>
        </>
      ) : null}
    </div>
  );
}
