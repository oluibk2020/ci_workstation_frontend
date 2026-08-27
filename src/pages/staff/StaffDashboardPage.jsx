import { QrCode } from "lucide-react";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

// Mock data — replace with bookingService/verificationService calls once
// the backend is connected (see backend spec §5.7, §5.9, §11).
const TODAYS_BOOKINGS = [
  { time: "10:00", code: "WS-01", client: "John Doe", status: "BOOKED" },
  { time: "10:00", code: "WS-02", client: "Ada Obi (Gift)", status: "ACTIVE" },
  { time: "11:00", code: "WS-03", client: "Peter James", status: "PENDING" },
];

export default function StaffDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Work Station Staff</h1>
        <Button size="lg">
          <QrCode size={18} />
          Scan QR
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active check-ins" value="8" tone="success" />
        <StatCard label="Upcoming today" value="14" />
        <StatCard label="Pending verification" value="3" tone="warning" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Available seats" value="12" tone="success" />
        <StatCard label="Occupied seats" value="8" tone="accent" />
      </div>

      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
          Today's bookings
        </p>
        <div className="mt-3 divide-y divide-[var(--color-line)]">
          {TODAYS_BOOKINGS.map((b, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <span className="font-mono-tight text-sm text-slate-400">{b.time}</span>
                <span className="font-mono-tight text-sm font-semibold text-[var(--color-primary)]">{b.code}</span>
                <span className="text-sm text-slate-600">{b.client}</span>
              </div>
              <Badge status={b.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
