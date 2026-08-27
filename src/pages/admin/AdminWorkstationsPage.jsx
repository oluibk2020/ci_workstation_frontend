import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useCatalog } from "../../context/CatalogContext";
import WorkstationFormModal from "../../components/workstation/WorkstationFormModal";
import Button from "../../components/common/Button";

export default function AdminWorkstationsPage() {
  const { workstations, branches, addWorkstation, updateWorkstation, removeWorkstation, getBranchName, getSeatsForWorkstation } =
    useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [error, setError] = useState("");

  const filtered = useMemo(
    () => (branchFilter === "ALL" ? workstations : workstations.filter((wk) => wk.branchId === branchFilter)),
    [workstations, branchFilter]
  );

  function openCreate() {
    setEditing(null);
    setError("");
    setModalOpen(true);
  }

  function openEdit(workstation) {
    setEditing(workstation);
    setError("");
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
    const result = removeWorkstation(workstation.id);
    if (!result.ok) {
      setError(`Can't delete "${workstation.name}": ${result.reason}`);
    } else {
      setError("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Workstation Types</h1>
          <p className="text-sm text-slate-500">
            A workstation is a type/category (e.g. "Standing Desk") that holds a daily rate. Add
            individual bookable seats under each type on the Seats page.
          </p>
        </div>
        <Button onClick={openCreate} disabled={branches.length === 0}>
          <Plus size={16} />
          New workstation type
        </Button>
      </div>

      {branches.length === 0 && (
        <div className="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4 text-sm text-amber-700">
          Create a branch first before adding workstation types.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

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

      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Branch</th>
              <th className="px-5 py-3">Seats</th>
              <th className="px-5 py-3 text-right">Daily rate</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {filtered.map((wk) => (
              <tr key={wk.id}>
                <td className="px-5 py-3 font-medium text-[var(--color-primary)]">{wk.name}</td>
                <td className="px-5 py-3 text-slate-500">{getBranchName(wk.branchId)}</td>
                <td className="px-5 py-3 text-slate-500">{getSeatsForWorkstation(wk.id).length}</td>
                <td className="px-5 py-3 text-right font-mono-tight font-semibold text-[var(--color-primary)]">
                  ₦{wk.dailyRate.toLocaleString()}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => openEdit(wk)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[var(--color-accent)]"
                      aria-label={`Edit ${wk.name}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(wk)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[var(--color-danger)]"
                      aria-label={`Delete ${wk.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && <p className="p-5 text-sm text-slate-400">No workstation types yet.</p>}
      </div>

      <WorkstationFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initialData={editing} />
    </div>
  );
}
