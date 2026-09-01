import { useState, useMemo } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useCatalog } from "../../context/CatalogContext";
import SeatFormModal from "../../components/seat/SeatFormModal";
import SeatCard from "../../components/seat/SeatCard";
import Button from "../../components/common/Button";

// Wired to the real backend. NOTE: no seat delete route exists — create,
// update, and status-update do. This page only offers those.
export default function AdminSeatsPage() {
  const { seatsWithDetails, workstations, isLoading, addSeat, updateSeat, updateSeatStatus } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [workstationFilter, setWorkstationFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(
    () =>
      workstationFilter === "ALL"
        ? seatsWithDetails
        : seatsWithDetails.filter((seat) => seat.workstationId === workstationFilter),
    [seatsWithDetails, workstationFilter]
  );

  function openCreate() {
    setEditing(null);
    setError("");
    setModalOpen(true);
  }

  function openEdit(seat) {
    setEditing(seat);
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(data) {
    setSubmitting(true);
    setError("");
    try {
      if (editing) {
        await updateSeat(editing.id, data);
      } else {
        await addSeat(data);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await updateSeatStatus(id, status);
    } catch (err) {
      setError(err.message || "Couldn't update status.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Seats</h1>
          <p className="text-sm text-slate-500">
            The actual bookable unit — create, edit, and manage status here. Removing a seat isn't
            available yet — the backend has no delete route for it.
          </p>
        </div>
        <Button onClick={openCreate} disabled={workstations.length === 0}>
          <Plus size={16} />
          New seat
        </Button>
      </div>

      {workstations.length === 0 && !isLoading && (
        <div className="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 text-sm text-amber-700">
          Create a workstation type first before adding seats.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
          {error}
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

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((seat) => (
            <SeatCard
              key={seat.id}
              seat={seat}
              workstationName={seat.workstationName}
              branchName={seat.branchName}
              pricePerDay={seat.pricePerDay}
              onEdit={openEdit}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && workstations.length > 0 && (
        <p className="text-sm text-slate-400">No seats under this workstation type yet.</p>
      )}

      <SeatFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editing}
        submitting={submitting}
      />
    </div>
  );
}
