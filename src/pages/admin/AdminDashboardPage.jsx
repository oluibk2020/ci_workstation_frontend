import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import StatCard from "../../components/common/StatCard";
import { useCatalog } from "../../context/CatalogContext";
import { adminUserService } from "../../services/adminUserService";
import { verificationService } from "../../services/verificationService";
import { bookingService } from "../../services/bookingService";
import { reportService } from "../../services/reportService";
import { todayISO } from "../../utils/businessDate";

/**
 * Every number here is real. "Revenue Today" now uses the new
 * /admin/reports/summary endpoint (Phase 7) — see reportService.js and
 * docs/PATCH_NOTES.md for the revenue definition used.
 *
 * BUG FIX (kept from a previous pass): each stat loads and fails
 * independently — a broken one shows its own small error inline, right
 * on that card, while every other card still shows real data.
 */
export default function AdminDashboardPage() {
  const { branches, isLoading: catalogLoading } = useCatalog();
  const [clientStats, setClientStats] = useState({ loading: true, error: "", total: null, active: null });
  const [verificationStats, setVerificationStats] = useState({ loading: true, error: "", pending: null });
  const [bookingStats, setBookingStats] = useState({ loading: true, error: "", today: null, activeSessions: null });
  const [revenueStats, setRevenueStats] = useState({ loading: true, error: "", today: null });

  const loadClientStats = useCallback(async () => {
    setClientStats((s) => ({ ...s, loading: true, error: "" }));
    try {
      const [total, active] = await Promise.all([
        adminUserService.list({ role: "USER", limit: 1 }),
        adminUserService.list({ role: "USER", status: "ACTIVE", limit: 1 }),
      ]);
      setClientStats({
        loading: false,
        error: "",
        total: total.pagination?.total ?? 0,
        active: active.pagination?.total ?? 0,
      });
    } catch (err) {
      setClientStats({ loading: false, error: err.message || "Failed to load.", total: null, active: null });
    }
  }, []);

  const loadVerificationStats = useCallback(async () => {
    setVerificationStats((s) => ({ ...s, loading: true, error: "" }));
    try {
      const result = await verificationService.listPending({ limit: 1 });
      setVerificationStats({ loading: false, error: "", pending: result.pagination?.total ?? 0 });
    } catch (err) {
      setVerificationStats({ loading: false, error: err.message || "Failed to load.", pending: null });
    }
  }, []);

  const loadBookingStats = useCallback(async () => {
    if (branches.length === 0) {
      setBookingStats({ loading: false, error: "", today: 0, activeSessions: 0 });
      return;
    }
    setBookingStats((s) => ({ ...s, loading: true, error: "" }));
    try {
      const perBranch = await Promise.all(branches.map((b) => bookingService.getTodaysBookings(b.id)));
      const all = perBranch.flatMap((r) => r.bookings || []);
      const activeSessions = all.filter((d) => d.checkIn?.status === "CHECKED_IN").length;
      setBookingStats({ loading: false, error: "", today: all.length, activeSessions });
    } catch (err) {
      setBookingStats({ loading: false, error: err.message || "Failed to load.", today: null, activeSessions: null });
    }
  }, [branches]);

  const loadRevenueStats = useCallback(async () => {
    setRevenueStats((s) => ({ ...s, loading: true, error: "" }));
    try {
      const today = todayISO();
      const result = await reportService.getSummary({ startDate: today, endDate: today });
      setRevenueStats({ loading: false, error: "", today: result.netRevenue });
    } catch (err) {
      setRevenueStats({ loading: false, error: err.message || "Failed to load.", today: null });
    }
  }, []);

  useEffect(() => {
    loadClientStats();
    loadVerificationStats();
    loadRevenueStats();
  }, [loadClientStats, loadVerificationStats, loadRevenueStats]);

  useEffect(() => {
    if (!catalogLoading) loadBookingStats();
  }, [catalogLoading, loadBookingStats]);

  function cardValue(loading, error, value) {
    if (loading) return <Loader2 size={16} className="animate-spin text-slate-300" />;
    if (error) return "—";
    return value;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[var(--color-primary)]">Business overview</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <StatCard
            label="Revenue today"
            value={cardValue(
              revenueStats.loading,
              revenueStats.error,
              revenueStats.today !== null ? `₦${revenueStats.today.toLocaleString()}` : null
            )}
            tone="accent"
          />
          {revenueStats.error && <p className="mt-1 text-xs text-[var(--color-danger)]">{revenueStats.error}</p>}
        </div>
        <div>
          <StatCard label="Total clients" value={cardValue(clientStats.loading, clientStats.error, clientStats.total)} />
          {clientStats.error && <p className="mt-1 text-xs text-[var(--color-danger)]">{clientStats.error}</p>}
        </div>
        <div>
          <StatCard
            label="Active clients"
            value={cardValue(clientStats.loading, clientStats.error, clientStats.active)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <StatCard
            label="Today's bookings (all branches)"
            value={cardValue(bookingStats.loading, bookingStats.error, bookingStats.today)}
          />
          {bookingStats.error && <p className="mt-1 text-xs text-[var(--color-danger)]">{bookingStats.error}</p>}
        </div>
        <StatCard
          label="Active sessions right now"
          value={cardValue(bookingStats.loading, bookingStats.error, bookingStats.activeSessions)}
          tone="success"
        />
        <div>
          <StatCard
            label="Pending verifications"
            value={cardValue(verificationStats.loading, verificationStats.error, verificationStats.pending)}
            tone="warning"
          />
          {verificationStats.error && <p className="mt-1 text-xs text-[var(--color-danger)]">{verificationStats.error}</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 p-6 text-center">
        <p className="text-sm text-slate-500">
          Want revenue over a longer range, or broken down by branch?{" "}
          <Link to="/admin/reports" className="text-[var(--color-accent)] hover:underline">
            See the full Reports page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
