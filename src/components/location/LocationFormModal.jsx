import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";

const EMPTY = { name: "", address: "", dailyRateDefault: "" };

export default function LocationFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(EMPTY);
  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? { name: initialData.name, address: initialData.address, dailyRateDefault: initialData.dailyRateDefault }
          : EMPTY
      );
    }
  }, [open, initialData]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ ...form, dailyRateDefault: Number(form.dailyRateDefault) || 0 });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit location" : "New location"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Location name</label>
          <input
            required
            value={form.name}
            onChange={update("name")}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="e.g. Sagamu"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Address</label>
          <input
            required
            value={form.address}
            onChange={update("address")}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="Street, area, state"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Default daily rate (₦)</label>
          <input
            required
            type="number"
            min="0"
            step="500"
            value={form.dailyRateDefault}
            onChange={update("dailyRateDefault")}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="6000"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Used as the suggested rate when creating a new workstation at this location — each
            workstation's rate can still be set individually.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Save changes" : "Create location"}</Button>
        </div>
      </form>
    </Modal>
  );
}
