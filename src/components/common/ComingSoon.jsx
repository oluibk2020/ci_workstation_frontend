import { Construction } from "lucide-react";

/**
 * Placeholder for screens scheduled in a later MVP phase (see docs Section
 * 25). Sidebar links route here so navigation works end-to-end while the
 * real screen is built out.
 */
export default function ComingSoon({ title, phase }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-20 text-center">
      <Construction size={28} className="text-slate-300" />
      <h1 className="mt-4 text-lg font-semibold text-[var(--color-primary)]">{title}</h1>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {phase ? `Scheduled for ${phase} of the build.` : "This screen is coming in a later build phase."}
      </p>
    </div>
  );
}
