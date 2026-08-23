import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useCatalog } from "../../context/CatalogContext";
import WorkstationFormModal from "../../components/workstation/WorkstationFormModal";
import WorkstationCard from "../../components/workstation/WorkstationCard";
import Button from "../../components/common/Button";

export default function AdminWorkstationsPage() {
  const { workstations, locations, addWorkstation, updateWorkstation, updateWorkstationStatus, removeWorkstation, getLocationName } =
    useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [locationFilter, setLocationFilter] = useState("ALL");

  const filtered = useMemo(
    () => (locationFilter === "ALL" ? workstations : workstations.filter((ws) => ws.locationId === locationFilter)),
    [workstations, locationFilter]
  );

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(workstation) {
    setEditing(workstation);
    setModalOpen(true);
  }

  function handleSubmit(data) {
    if (editing) {
      updateWorkstation(editing.id, data);
    } else {
      addWorkstation(data);
    }
  }

  function handleDelete(workstation) {
    if (confirm(`Remove ${workstation.code}? This can't be undone.`)) {
      removeWorkstation(workstation.id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Workstations</h1>
          <p className="text-sm text-slate-500">Create, edit, and manage the status of every desk.</p>
        </div>
        <Button onClick={openCreate} disabled={locations.length === 0}>
          <Plus size={16} />
          New workstation
        </Button>
      </div>

      {locations.length === 0 && (
        <div className="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 text-sm text-amber-700">
          Create a location first before adding workstations.
        </div>
      )}

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
          <WorkstationCard
            key={ws.id}
            workstation={ws}
            locationName={getLocationName(ws.locationId)}
            onEdit={openEdit}
            onDelete={handleDelete}
            onStatusChange={updateWorkstationStatus}
          />
        ))}
      </div>

      {filtered.length === 0 && locations.length > 0 && (
        <p className="text-sm text-slate-400">No workstations at this location yet.</p>
      )}

      <WorkstationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editing}
      />
    </div>
  );
}
