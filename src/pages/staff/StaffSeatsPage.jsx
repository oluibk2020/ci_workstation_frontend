import { useState, useMemo } from "react";
import { useCatalog } from "../../context/CatalogContext";
import SeatCard from "../../components/seat/SeatCard";

export default function StaffSeatsPage() {
  const { seatsWithDetails, branches } = useCatalog();
  const [branchFilter, setBranchFilter] = useState("ALL");

  const filtered = useMemo(
    () => (branchFilter === "ALL" ? seatsWithDetails : seatsWithDetails.filter((seat) => seat.branchId === branchFilter)),
    [seatsWithDetails, branchFilter]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Seats</h1>
        <p className="text-sm text-slate-500">
          Live status across your branches. Contact a Super Admin to add, edit, or retire a seat, or
          to change workstation pricing.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setBranchFilter("ALL")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            branchFilter === "ALL" ? "bg-[var(--color-primary)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All branches
        </button>
        {branches.map((b) => (
          <button
            key={b.id}
            onClick={() => setBranchFilter(b.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              branchFilter === b.id ? "bg-[var(--color-primary)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((seat) => (
          <SeatCard
            key={seat.id}
            seat={seat}
            workstationName={seat.workstationName}
            branchName={seat.branchName}
            dailyRate={seat.dailyRate}
            canManage={false}
          />
        ))}
      </div>
    </div>
  );
}
