import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useCatalog } from "../../context/CatalogContext";

function emptyForm(defaultBranchId) {
  return { name: "", branchId: defaultBranchId || "", dailyRate: "" };
}

export default function WorkstationFormModal({ open, onClose, onSubmit, initialData }) {
  const { branches } = useCatalog();
  const isEdit = !!initialData;
  const [form, setForm] = useState(emptyForm(branches[0]?.id));

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? { name: initialData.name, branchId: initialData.branchId, dailyRate: initialData.dailyRate }
          : emptyForm(branches[0]?.id)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ ...form, dailyRate: Number(form.dailyRate) || 0 });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit workstation type" : "New workstation type"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Type name</label>
          <input
            required
            value={form.name}
            onChange={update("name")}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="e.g. Standing Desk, Quiet Booth, Shared Bench"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Branch</label>
          <select
            required
            value={form.branchId}
            onChange={update("branchId")}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          >
            <option value="" disabled>
              Select a branch
            </option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Daily rate (₦)</label>
          <input
            required
            type="number"
            min="0"
            step="500"
            value={form.dailyRate}
            onChange={update("dailyRate")}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="8000"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Every seat under this workstation type shares this rate. Individual seats only carry
            status and physical specs, not their own price.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Save changes" : "Create workstation type"}</Button>
        </div>
      </form>
    </Modal>
  );
}
