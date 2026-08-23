import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { useCatalog } from "../../context/CatalogContext";
import LocationFormModal from "../../components/location/LocationFormModal";
import Button from "../../components/common/Button";

export default function AdminLocationsPage() {
  const { locations, workstations, addLocation, updateLocation, removeLocation } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  function openCreate() {
    setEditing(null);
    setError("");
    setModalOpen(true);
  }

  function openEdit(location) {
    setEditing(location);
    setError("");
    setModalOpen(true);
  }

  function handleSubmit(data) {
    if (editing) {
      updateLocation(editing.id, data);
    } else {
      addLocation(data);
    }
  }

  function handleDelete(location) {
    const result = removeLocation(location.id);
    if (!result.ok) {
      setError(`Can't delete "${location.name}": ${result.reason}`);
    } else {
      setError("");
    }
  }

  function workstationCount(locationId) {
    return workstations.filter((ws) => ws.locationId === locationId).length;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Locations</h1>
          <p className="text-sm text-slate-500">
            Only Admins can create or edit locations. Pricing is set per location here.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          New location
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {locations.map((loc) => (
          <div key={loc.id} className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-[var(--color-accent)]">
                <MapPin size={18} />
                <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide">{loc.name}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(loc)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[var(--color-accent)]"
                  aria-label={`Edit ${loc.name}`}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(loc)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[var(--color-danger)]"
                  aria-label={`Delete ${loc.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600">{loc.address}</p>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-4 text-sm">
              <span className="text-slate-500">{workstationCount(loc.id)} workstation(s)</span>
              <span className="font-mono-tight font-semibold text-[var(--color-primary)]">
                from ₦{loc.dailyRateDefault.toLocaleString()}/day
              </span>
            </div>
          </div>
        ))}
      </div>

      <LocationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editing}
      />
    </div>
  );
}
