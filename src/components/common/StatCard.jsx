export default function StatCard({ label, value, icon: Icon, tone = "default" }) {
  const toneClass =
    {
      default: "text-[var(--color-primary)]",
      accent: "text-[var(--color-accent)]",
      success: "text-[var(--color-success)]",
      warning: "text-[var(--color-warning)]",
      danger: "text-[var(--color-danger)]",
    }[tone] || "text-[var(--color-primary)]";

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        {Icon && <Icon size={16} className="text-slate-300" />}
      </div>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}
