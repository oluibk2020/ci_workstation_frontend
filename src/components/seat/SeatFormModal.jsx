import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { SEAT_STATUS } from "../../utils/constants";
import { useCatalog } from "../../context/CatalogContext";

function emptyForm(defaultWorkstationId) {
  return {
    code: "",
    workstationId: defaultWorkstationId || "",
    externalMonitor: false,
    powerOutlets: 2,
    internetMbps: 300,
    status: SEAT_STATUS.AVAILABLE,
  };
}

export default function SeatFormModal({ open, onClose, onSubmit, initialData }) {
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
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      powerOutlets: Number(form.powerOutlets) || 0,
      internetMbps: Number(form.internetMbps) || 0,
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit seat" : "New seat"} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Seat code</label>
            <input
              required
              value={form.code}
              onChange={update("code")}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              placeholder="WS-14"
            />
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
                  {wk.name} — {getBranchName(wk.branchId)} (₦{wk.dailyRate.toLocaleString()}/day)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Power outlets</label>
            <input
              type="number"
              min="0"
              value={form.powerOutlets}
              onChange={update("powerOutlets")}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Internet (Mbps)</label>
            <input
              type="number"
              min="0"
              step="50"
              value={form.internetMbps}
              onChange={update("internetMbps")}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[var(--color-line)] px-3 py-2.5">
          <label htmlFor="externalMonitor" className="text-sm font-medium text-slate-700">
            External monitor available
          </label>
          <input
            id="externalMonitor"
            type="checkbox"
            checked={form.externalMonitor}
            onChange={update("externalMonitor")}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
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
          <Button type="submit">{isEdit ? "Save changes" : "Create seat"}</Button>
        </div>
      </form>
    </Modal>
  );
}
