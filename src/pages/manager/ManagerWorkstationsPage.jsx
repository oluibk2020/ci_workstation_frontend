import { useState, useMemo } from "react";
import { useCatalog } from "../../context/CatalogContext";
import WorkstationCard from "../../components/workstation/WorkstationCard";

export default function ManagerWorkstationsPage() {
  const { workstations, locations, getLocationName } = useCatalog();
  const [locationFilter, setLocationFilter] = useState("ALL");

  const filtered = useMemo(
    () => (locationFilter === "ALL" ? workstations : workstations.filter((ws) => ws.locationId === locationFilter)),
    [workstations, locationFilter]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Workstations</h1>
        <p className="text-sm text-slate-500">
          Live status across your locations. Contact an admin to add, edit, or retire a desk.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setLocationFilter("ALL")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            locationFilter === "ALL" ? "bg-[var(--color-primary)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All locations
        </button>
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setLocationFilter(loc.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              locationFilter === loc.id ? "bg-[var(--color-primary)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {loc.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ws) => (
          <WorkstationCard key={ws.id} workstation={ws} locationName={getLocationName(ws.locationId)} canManage={false} />
        ))}
      </div>
    </div>
  );
}
