import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { QrCode, Loader2 } from "lucide-react";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { useCatalog } from "../../context/CatalogContext";
import { bookingService } from "../../services/bookingService";
import { verificationService } from "../../services/verificationService";

export default function StaffDashboardPage() {
  const { branches, seatsWithDetails } = useCatalog();
  const [todayBookings, setTodayBookings] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [branchResults, verificationResult] = await Promise.all([
        Promise.all(branches.map((branch) => bookingService.getTodaysBookings(branch.id))),
        verificationService.listPending({ limit: 1 }),
      ]);

      setTodayBookings(branchResults.flatMap((result) => result.bookings || []));
      setPendingVerifications(verificationResult.pagination?.total || 0);
    } catch (err) {
      setError(err.message || "Couldn't load the staff dashboard.");
    } finally {
      setLoading(false);
    }
  }, [branches]);

  useEffect(() => {
    if (branches.length > 0) loadDashboard();
    else setLoading(false);
  }, [branches, loadDashboard]);

  const stats = useMemo(() => {
    const activeSeats = seatsWithDetails.filter((seat) => seat.status === "ACTIVE");
    const bookedSeatIds = new Set(todayBookings.map((booking) => booking.seat?.id).filter(Boolean));
    const checkedIn = todayBookings.filter((booking) => booking.checkIn?.status === "CHECKED_IN").length;

    return {
      activeCheckIns: checkedIn,
      upcoming: todayBookings.filter((booking) => !booking.checkIn).length,
      availableSeats: Math.max(activeSeats.length - bookedSeatIds.size, 0),
      occupiedSeats: bookedSeatIds.size,
    };
  }, [seatsWithDetails, todayBookings]);

  const recentBookings = todayBookings.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Work Station Staff</h1>
          <p className="text-sm text-slate-500">Live operational overview across your branches.</p>
        </div>
        <Button as={Link} to="/staff/scan" size="lg">
          <QrCode size={18} />
          Scan QR
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadDashboard}>Retry</Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-line)] bg-white p-6 text-sm text-slate-400">
          <Loader2 size={18} className="animate-spin" /> Loading live staff data...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Active check-ins" value={stats.activeCheckIns} tone="success" />
            <StatCard label="Upcoming today" value={stats.upcoming} />
            <StatCard label="Pending verification" value={pendingVerifications} tone="warning" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Available seats" value={stats.availableSeats} tone="success" />
            <StatCard label="Booked seats today" value={stats.occupiedSeats} tone="accent" />
          </div>

          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">Today's bookings</p>
              <Link to="/staff/bookings" className="text-xs font-medium text-[var(--color-accent)] hover:underline">View all</Link>
            </div>
            {recentBookings.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No bookings across your branches today.</p>
            ) : (
              <div className="mt-3 divide-y divide-[var(--color-line)]">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium text-[var(--color-primary)]">
                        {booking.beneficiary?.name || "Unknown client"} · Seat {booking.seat?.seatId}
                      </p>
                      <p className="text-xs text-slate-400">
                        {booking.booking?.workstation?.name} · {booking.booking?.bookedBy?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={booking.beneficiary?.verificationStatus || "UNVERIFIED"} />
                      <Badge status={booking.checkIn?.status || "PENDING"} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
