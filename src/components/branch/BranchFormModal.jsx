import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";

const DAYS = [
  { value: "MON", label: "Mon" },
  { value: "TUE", label: "Tue" },
  { value: "WED", label: "Wed" },
  { value: "THU", label: "Thu" },
  { value: "FRI", label: "Fri" },
  { value: "SAT", label: "Sat" },
  { value: "SUN", label: "Sun" },
];

const EMPTY = {
  name: "",
  address: "",
  timezone: "Africa/Lagos",
  openTime: "08:00",
  closeTime: "20:00",
  operatingDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
};

export default function BranchFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(EMPTY);
  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...EMPTY, ...initialData } : EMPTY);
    }
  }, [open, initialData]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function toggleDay(day) {
    setForm((f) => ({
      ...f,
      operatingDays: f.operatingDays.includes(day)
        ? f.operatingDays.filter((d) => d !== day)
        : [...f.operatingDays, day],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit branch" : "New branch"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Branch name</label>
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

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Opens</label>
            <input
              type="time"
              required
              value={form.openTime}
              onChange={update("openTime")}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Closes</label>
            <input
              type="time"
              required
              value={form.closeTime}
              onChange={update("closeTime")}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Timezone</label>
            <input
              required
              value={form.timezone}
              onChange={update("timezone")}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              placeholder="Africa/Lagos"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Operating days</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  form.operatingDays.includes(day.value)
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "border-[var(--color-line)] text-slate-500 hover:border-slate-300"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            The backend uses opening/closing time and timezone to automatically check clients out at
            closing, and operating days to determine which dates count as bookable business days.
          </p>
        </div>

        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Pricing isn't set here — it lives on each Workstation type you create under this branch, so
          different desk types at the same branch can have different rates.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Save changes" : "Create branch"}</Button>
        </div>
      </form>
    </Modal>
  );
}
