import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useCatalog } from "../../context/CatalogContext";
import SeatFormModal from "../../components/seat/SeatFormModal";
import SeatCard from "../../components/seat/SeatCard";
import Button from "../../components/common/Button";

export default function AdminSeatsPage() {
  const { seatsWithDetails, workstations, addSeat, updateSeat, updateSeatStatus, removeSeat } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [workstationFilter, setWorkstationFilter] = useState("ALL");

  const filtered = useMemo(
    () =>
      workstationFilter === "ALL"
        ? seatsWithDetails
        : seatsWithDetails.filter((seat) => seat.workstationId === workstationFilter),
    [seatsWithDetails, workstationFilter]
  );

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(seat) {
    setEditing(seat);
    setModalOpen(true);
  }

  function handleSubmit(data) {
    if (editing) {
      updateSeat(editing.id, data);
    } else {
      addSeat(data);
    }
  }

  function handleDelete(seat) {
    if (confirm(`Remove ${seat.code}? This can't be undone.`)) {
      removeSeat(seat.id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Seats</h1>
          <p className="text-sm text-slate-500">The actual bookable unit — create, edit, and manage status here.</p>
        </div>
        <Button onClick={openCreate} disabled={workstations.length === 0}>
          <Plus size={16} />
          New seat
        </Button>
      </div>

      {workstations.length === 0 && (
        <div className="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 text-sm text-amber-700">
          Create a workstation type first before adding seats.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setWorkstationFilter("ALL")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            workstationFilter === "ALL" ? "bg-[var(--color-primary)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All types
        </button>
        {workstations.map((wk) => (
          <button
            key={wk.id}
            onClick={() => setWorkstationFilter(wk.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              workstationFilter === wk.id ? "bg-[var(--color-primary)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {wk.name}
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
            onEdit={openEdit}
            onDelete={handleDelete}
            onStatusChange={updateSeatStatus}
          />
        ))}
      </div>

      {filtered.length === 0 && workstations.length > 0 && (
        <p className="text-sm text-slate-400">No seats under this workstation type yet.</p>
      )}

      <SeatFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initialData={editing} />
    </div>
  );
}
