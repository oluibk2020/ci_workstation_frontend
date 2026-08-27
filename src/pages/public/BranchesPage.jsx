import { MapPin } from "lucide-react";
import Eyebrow from "../../components/common/Eyebrow";
import { useCatalog } from "../../context/CatalogContext";

export default function BranchesPage() {
  const { branches, getWorkstationsForBranch, getSeatsForWorkstation } = useCatalog();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <Eyebrow>Branches</Eyebrow>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
        Every branch, priced on its own
      </h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        Pricing varies by branch and by desk type — a Standing Desk in one branch can cost
        differently from another, set by our admin team based on that branch's running costs.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {branches.map((branch) => {
          const workstations = getWorkstationsForBranch(branch.id);
          const seatCount = workstations.reduce((sum, wk) => sum + getSeatsForWorkstation(wk.id).length, 0);
          const rates = workstations.map((wk) => wk.dailyRate);
          const minRate = rates.length ? Math.min(...rates) : 0;

          return (
            <div key={branch.id} className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
              <div className="flex items-center gap-2 text-[var(--color-accent)]">
                <MapPin size={18} />
                <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide">{branch.name}</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-[var(--color-primary)]">{branch.address}</p>
              <p className="mt-1 font-mono-tight text-xs text-slate-400">
                Open {branch.openTime}–{branch.closeTime} · {branch.operatingDays?.join(", ")}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-4 text-sm text-slate-500">
                <span>{seatCount} seat{seatCount === 1 ? "" : "s"}</span>
                <span className="font-mono-tight font-semibold text-[var(--color-primary)]">
                  from ₦{minRate.toLocaleString()}/day
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
