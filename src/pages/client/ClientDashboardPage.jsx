import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Wallet, CalendarCheck, Timer, Loader2 } from "lucide-react";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { bookingService } from "../../services/bookingService";
import { notificationService } from "../../services/notificationService";

/**
 * Rewritten to use real data — the previous version had two entirely
 * hardcoded booking cards (WS-04/WS-02, fixed dates, fixed prices) left
 * over from before Booking existed, with View QR/Cancel/Reassign buttons
 * that did nothing at all. That's what showed up as "buttons not
 * working."
 *
 * "View QR" now links to /client/qr — deliberately not booking-specific,
 * since QR is a persistent per-user credential, not generated per
 * booking (see docs/BACKEND_CODE_REVIEW.md §3). Cancel/Reassign route to
 * /client/bookings, where the real cancel/reassign modals already exist
 * and work — rather than duplicating that logic here, this page stays a
 * quick-glance summary and the actual mutation happens in one place.
 */
export default function ClientDashboardPage() {
  const { user, verificationStatus } = useAuth();
  const { balance } = useWallet();

  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsResult, notificationsResult] = await Promise.all([
        bookingService.list({ status: "ACTIVE" }),
        notificationService
          .list({ limit: 3 })
          .catch(() => ({ notifications: [] })),
      ]);
      setBookings(bookingsResult.bookings || []);
      setNotifications(notificationsResult.notifications || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = new Date().toISOString().slice(0, 10);

  function nextActiveDate(booking) {
    return (booking.dates || []).find(
      (d) => d.status === "ACTIVE" && d.bookingDate.slice(0, 10) >= today,
    );
  }

  const myBooking = bookings.find(
    (b) =>
      b.bookedByUserId === user?.id &&
      b.beneficiaryUserId === user?.id &&
      nextActiveDate(b),
  );
  const giftedBooking = bookings.find(
    (b) =>
      b.bookedByUserId === user?.id &&
      b.beneficiaryUserId !== user?.id &&
      nextActiveDate(b),
  );

  const upcomingCount = bookings.filter((b) => nextActiveDate(b)).length;
  const activeCheckIn = bookings
    .flatMap((b) => b.dates || [])
    .find((d) => d.checkIn?.status === "CHECKED_IN");

  function formatDateRange(booking) {
    const dates = (booking.dates || [])
      .map((d) => d.bookingDate.slice(0, 10))
      .sort();
    if (dates.length === 0) return "";
    const first = new Date(dates[0]).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    if (dates.length === 1) return `${first} (1 day)`;
    const last = new Date(dates[dates.length - 1]).toLocaleDateString(
      undefined,
      { month: "short", day: "numeric" },
    );
    return `${first} – ${last} (${dates.length} day${dates.length === 1 ? "" : "s"})`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">
            Welcome, {user?.name}
          </h1>
          <p className="text-sm text-slate-500">
            Here's what's happening with your bookings.
          </p>
        </div>
        <Button as={Link} to="/client/book">
          Book a workstation
        </Button>
      </div>

      {verificationStatus === "UNVERIFIED" && (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 text-sm text-amber-700">
          <Badge status="UNVERIFIED" />
          Your account isn't verified yet. Submit a profile photo and ID
          document before your first visit — first-time physical access isn't
          allowed until verification is complete.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/client/wallet" className="block">
          <StatCard
            label="Wallet balance"
            value={`₦${balance.toLocaleString()}`}
            icon={Wallet}
            tone="accent"
          />
        </Link>
        <StatCard
          label="Upcoming bookings"
          value={loading ? "—" : upcomingCount}
          icon={CalendarCheck}
        />
        <StatCard
          label="Active session"
          value={activeCheckIn ? "In progress" : "—"}
          icon={Timer}
        />
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading your
          bookings...
        </p>
      ) : (
        <>
          {myBooking && (
            <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
              <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
                Upcoming booking
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--color-primary)]">
                    {myBooking.seat.seatId} · {myBooking.branch.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDateRange(myBooking)} · Booked for: Self · Paid: ₦
                    {Number(myBooking.totalAmount).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button as={Link} to="/client/qr" variant="outline" size="sm">
                    View QR
                  </Button>
                  <Button
                    as={Link}
                    to="/client/bookings"
                    variant="ghost"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    as={Link}
                    to="/client/bookings"
                    variant="ghost"
                    size="sm"
                  >
                    Reassign
                  </Button>
                </div>
              </div>
            </div>
          )}

          {giftedBooking && (
            <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
              <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
                Gifted bookings
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--color-primary)]">
                    {giftedBooking.seat.seatId} · {giftedBooking.branch.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDateRange(giftedBooking)} · Gifted to:{" "}
                    {giftedBooking.beneficiary.name} · Paid: ₦
                    {Number(giftedBooking.totalAmount).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button as={Link} to="/client/qr" variant="outline" size="sm">
                    View QR
                  </Button>
                  <Button
                    as={Link}
                    to="/client/bookings"
                    variant="ghost"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    as={Link}
                    to="/client/bookings"
                    variant="ghost"
                    size="sm"
                  >
                    Reassign
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!myBooking && !giftedBooking && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-12 text-center">
              <p className="text-sm text-slate-500">
                No upcoming bookings yet.
              </p>
              <Button as={Link} to="/client/book" size="sm">
                Book a workstation
              </Button>
            </div>
          )}
        </>
      )}

      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
          Recent activity
        </p>
        {notifications.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No recent activity yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div>
                  <p className="font-medium text-[var(--color-primary)]">
                    {n.title}
                  </p>
                  <p className="text-slate-500">{n.message}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
