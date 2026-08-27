import { Link } from "react-router-dom";
import { Wallet, CalendarCheck, Timer } from "lucide-react";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";

// Mock data — replace with bookingService/sessionService calls once the
// backend is connected (see docs Sections 9, 12, 13).
const UPCOMING_BOOKING = {
  code: "WS-04",
  branch: "Sagamu",
  dates: "Aug 24 – Aug 26 (3 days)",
  bookedFor: "Self",
  total: "₦24,000",
};

const GIFTED_BOOKING = {
  code: "WS-02",
  branch: "Sagamu",
  dates: "Aug 28 (1 day)",
  guest: "Ada Obi",
  total: "₦6,000",
};

export default function ClientDashboardPage() {
  const { user, verificationStatus } = useAuth();
  const { balance } = useWallet();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Welcome, {user?.name}</h1>
          <p className="text-sm text-slate-500">Here's what's happening with your bookings.</p>
        </div>
        <Button as={Link} to="/client/book">Book a workstation</Button>
      </div>

      {verificationStatus === "UNVERIFIED" && (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 text-sm text-amber-700">
          <Badge status="UNVERIFIED" />
          Your account isn't verified yet. Submit a profile photo and ID document before your first
          visit — first-time physical access isn't allowed until verification is complete.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/client/wallet" className="block">
          <StatCard label="Wallet balance" value={`₦${balance.toLocaleString()}`} icon={Wallet} tone="accent" />
        </Link>
        <StatCard label="Upcoming bookings" value="2" icon={CalendarCheck} />
        <StatCard label="Active session" value="—" icon={Timer} />
      </div>

      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
          Upcoming booking
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-[var(--color-primary)]">
              {UPCOMING_BOOKING.code} · {UPCOMING_BOOKING.branch}
            </p>
            <p className="text-sm text-slate-500">{UPCOMING_BOOKING.dates} · Booked for: {UPCOMING_BOOKING.bookedFor} · Paid: {UPCOMING_BOOKING.total}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">View QR</Button>
            <Button variant="ghost" size="sm">Cancel</Button>
            <Button variant="ghost" size="sm">Reassign</Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
          Gifted bookings
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-[var(--color-primary)]">
              {GIFTED_BOOKING.code} · {GIFTED_BOOKING.branch}
            </p>
            <p className="text-sm text-slate-500">{GIFTED_BOOKING.dates} · Gifted to: {GIFTED_BOOKING.guest} · Paid: {GIFTED_BOOKING.total}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">View QR</Button>
            <Button variant="ghost" size="sm">Cancel</Button>
            <Button variant="ghost" size="sm">Reassign</Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
          Recent activity
        </p>
        <p className="mt-3 text-sm text-slate-400">No recent activity yet.</p>
      </div>
    </div>
  );
}
