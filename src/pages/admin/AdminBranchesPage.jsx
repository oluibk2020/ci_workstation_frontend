import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { useCatalog } from "../../context/CatalogContext";
import BranchFormModal from "../../components/branch/BranchFormModal";
import Button from "../../components/common/Button";

export default function AdminBranchesPage() {
  const { branches, workstations, addBranch, updateBranch, removeBranch, getWorkstationsForBranch } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  function openCreate() {
    setEditing(null);
    setError("");
    setModalOpen(true);
  }

  function openEdit(branch) {
    setEditing(branch);
    setError("");
    setModalOpen(true);
  }

  function handleSubmit(data) {
    if (editing) {
      updateBranch(editing.id, data);
    } else {
      addBranch(data);
    }
  }

  function handleDelete(branch) {
    const result = removeBranch(branch.id);
    if (!result.ok) {
      setError(`Can't delete "${branch.name}": ${result.reason}`);
    } else {
      setError("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Branches</h1>
          <p className="text-sm text-slate-500">
            Only Super Admins can create or edit branches. Pricing is set per workstation type, not here.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          New branch
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {branches.map((branch) => {
          const workstationCount = getWorkstationsForBranch(branch.id).length;
          return (
            <div key={branch.id} className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <MapPin size={18} />
                  <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide">{branch.name}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(branch)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[var(--color-accent)]"
                    aria-label={`Edit ${branch.name}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(branch)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[var(--color-danger)]"
                    aria-label={`Delete ${branch.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{branch.address}</p>
              <p className="mt-2 font-mono-tight text-xs text-slate-400">
                {branch.openTime}–{branch.closeTime} · {branch.timezone} · {branch.operatingDays?.join(", ")}
              </p>
              <div className="mt-4 border-t border-[var(--color-line)] pt-4 text-sm text-slate-500">
                {workstationCount} workstation type{workstationCount === 1 ? "" : "s"}
              </div>
            </div>
          );
        })}
      </div>

      <BranchFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initialData={editing} />
    </div>
  );
}
