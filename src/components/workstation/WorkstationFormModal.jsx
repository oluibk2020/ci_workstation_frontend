import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { WORKSTATION_STATUS } from "../../utils/constants";
import { useCatalog } from "../../context/CatalogContext";

const DESK_TYPES = ["Standing Desk", "Shared Bench", "Quiet Booth"];
const SEATING_TYPES = ["Ergonomic Chair", "Standard Chair"];

function emptyForm(defaultLocationId, defaultRate) {
  return {
    code: "",
    locationId: defaultLocationId || "",
    deskType: DESK_TYPES[0],
    seating: SEATING_TYPES[0],
    externalMonitor: false,
    powerOutlets: 2,
    internetMbps: 300,
    dailyRate: defaultRate || "",
    status: WORKSTATION_STATUS.AVAILABLE,
  };
}

export default function WorkstationFormModal({ open, onClose, onSubmit, initialData }) {
  const { locations } = useCatalog();
  const isEdit = !!initialData;
  const [form, setForm] = useState(emptyForm(locations[0]?.id));

  useEffect(() => {
    if (open) {
      setForm(initialData || emptyForm(locations[0]?.id, locations[0]?.dailyRateDefault));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  function update(field) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  function handleLocationChange(e) {
    const locationId = e.target.value;
    const loc = locations.find((l) => l.id === locationId);
    setForm((f) => ({
      ...f,
      locationId,
      dailyRate: isEdit ? f.dailyRate : loc?.dailyRateDefault ?? f.dailyRate,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      powerOutlets: Number(form.powerOutlets) || 0,
      internetMbps: Number(form.internetMbps) || 0,
      dailyRate: Number(form.dailyRate) || 0,
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit workstation" : "New workstation"} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Workstation code</label>
            <input
              required
              value={form.code}
              onChange={update("code")}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              placeholder="WS-14"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Location</label>
            <select
              required
              value={form.locationId}
              onChange={handleLocationChange}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            >
              <option value="" disabled>
                Select a location
              </option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Desk type</label>
            <select
              value={form.deskType}
              onChange={update("deskType")}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            >
              {DESK_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Seating</label>
            <select
              value={form.seating}
              onChange={update("seating")}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            >
              {SEATING_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
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
          <div>
            <label className="text-sm font-medium text-slate-700">Daily rate (₦)</label>
            <input
              type="number"
              min="0"
              step="500"
              required
              value={form.dailyRate}
              onChange={update("dailyRate")}
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
              {Object.values(WORKSTATION_STATUS).map((s) => (
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
          <Button type="submit">{isEdit ? "Save changes" : "Create workstation"}</Button>
        </div>
      </form>
    </Modal>
  );
}
