const METRICS = [
  { label: "POWER", value: "STABLE", tone: "text-[var(--color-success)]" },
  { label: "INTERNET", value: "512 Mbps", tone: "text-[var(--color-success)]" },
  { label: "SEATS OPEN", value: "23 / 40", tone: "text-white" },
  { label: "UPTIME (30D)", value: "99.96%", tone: "text-[var(--color-success)]" },
];

export default function StatusStrip() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-[var(--color-success)] status-dot" />
        <span className="font-mono-tight text-[11px] uppercase tracking-wider text-slate-400">
          Sagamu Branch — live status
        </span>
      </div>
      <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} className="px-4 py-3.5">
            <p className="font-mono-tight text-[10px] uppercase tracking-wider text-slate-500">{m.label}</p>
            <p className={`mt-1 font-mono-tight text-base font-semibold ${m.tone}`}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
