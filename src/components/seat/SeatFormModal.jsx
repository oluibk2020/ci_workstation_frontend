import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { SEAT_STATUS } from "../../utils/constants";
import { useCatalog } from "../../context/CatalogContext";

function emptyForm(defaultWorkstationId) {
  return {
    seatId: "",
    workstationId: defaultWorkstationId || "",
    status: SEAT_STATUS.ACTIVE,
  };
}

export default function SeatFormModal({ open, onClose, onSubmit, initialData, submitting }) {
  const { workstations, getBranchName } = useCatalog();
  const isEdit = !!initialData;
  const [form, setForm] = useState(emptyForm(workstations[0]?.id));

  useEffect(() => {
    if (open) {
      setForm(initialData || emptyForm(workstations[0]?.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit seat" : "New seat"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Seat label</label>
          <input
            required
            value={form.seatId}
            onChange={update("seatId")}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="e.g. A1"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            A short label unique within its workstation type (e.g. "A1", "A2").
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Workstation type</label>
          <select
            required
            value={form.workstationId}
            onChange={update("workstationId")}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          >
            <option value="" disabled>
              Select a workstation type
            </option>
            {workstations.map((wk) => (
              <option key={wk.id} value={wk.id}>
                {wk.name} — {getBranchName(wk.branchId)} (₦{wk.pricePerDay.toLocaleString()}/day)
              </option>
            ))}
          </select>
        </div>

        {isEdit && (
          <div>
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              value={form.status}
              onChange={update("status")}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            >
              {Object.values(SEAT_STATUS).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Create seat"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
