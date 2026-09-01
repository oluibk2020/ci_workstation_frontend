import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";

const DAYS = [
  { value: "MONDAY", label: "Mon" },
  { value: "TUESDAY", label: "Tue" },
  { value: "WEDNESDAY", label: "Wed" },
  { value: "THURSDAY", label: "Thu" },
  { value: "FRIDAY", label: "Fri" },
  { value: "SATURDAY", label: "Sat" },
  { value: "SUNDAY", label: "Sun" },
];

const EMPTY = {
  name: "",
  address: "",
  timezone: "Africa/Lagos",
  openingTime: "08:00",
  closingTime: "20:00",
  operatingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
};

// Create-only — the backend has no branch update/delete route yet, so
// this form never runs in "edit" mode.
export default function BranchFormModal({ open, onClose, onSubmit, submitting, submitError }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

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
  }

  return (
    <Modal open={open} onClose={onClose} title="New branch">
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
              value={form.openingTime}
              onChange={update("openingTime")}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Closes</label>
            <input
              type="time"
              required
              value={form.closingTime}
              onChange={update("closingTime")}
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
        </div>

        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Pricing isn't set here — it lives on each Workstation type you create under this branch.
        </p>

        {submitError && <p className="text-sm text-[var(--color-danger)]">{submitError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create branch"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
