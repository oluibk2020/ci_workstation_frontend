import StatCard from "../../components/common/StatCard";

// Mock data — replace with reporting/analytics service calls once the
// backend is connected (see docs Section 14, 23).
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[var(--color-primary)]">Business overview</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total clients" value="1,248" />
        <StatCard label="Active clients" value="327" tone="accent" />
        <StatCard label="Today's bookings" value="84" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active sessions" value="31" tone="success" />
        <StatCard label="Total days booked" value="612" />
        <StatCard label="Avg. days / booking" value="2.4" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Pending approvals" value="6" tone="warning" />
        <StatCard label="Reschedule requests" value="4" tone="accent" />
      </div>

      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
        <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
          Revenue (all locations)
        </p>
        <p className="mt-2 text-3xl font-extrabold text-[var(--color-primary)]">₦4,850,000</p>
      </div>
    </div>
  );
}
