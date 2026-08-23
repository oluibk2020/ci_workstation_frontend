import { MapPin } from "lucide-react";
import Eyebrow from "../../components/common/Eyebrow";
import { useCatalog } from "../../context/CatalogContext";

export default function LocationsPage() {
  const { locations, workstations } = useCatalog();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <Eyebrow>Locations</Eyebrow>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
        Every location, priced on its own
      </h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        Pricing varies by location — a desk in one part of the city can cost differently from another,
        set by our admin team based on that location's running costs.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {locations.map((loc) => {
          const deskCount = workstations.filter((ws) => ws.locationId === loc.id).length;
          return (
            <div key={loc.id} className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
              <div className="flex items-center gap-2 text-[var(--color-accent)]">
                <MapPin size={18} />
                <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide">{loc.name}</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-[var(--color-primary)]">{loc.address}</p>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-4 text-sm text-slate-500">
                <span>{deskCount} desk{deskCount === 1 ? "" : "s"}</span>
                <span className="font-mono-tight font-semibold text-[var(--color-primary)]">
                  from ₦{loc.dailyRateDefault.toLocaleString()}/day
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
