import { Pencil, Trash2, Monitor, Zap, Wifi } from "lucide-react";
import Badge from "../common/Badge";
import { WORKSTATION_STATUS } from "../../utils/constants";

const STATUS_OPTIONS = Object.values(WORKSTATION_STATUS);

export default function WorkstationCard({ workstation, locationName, onEdit, onDelete, onStatusChange, canManage = true }) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
            {workstation.code} · {locationName}
          </p>
          <p className="mt-1 font-semibold text-[var(--color-primary)]">{workstation.deskType}</p>
        </div>
        {canManage && onEdit && (
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(workstation)}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[var(--color-accent)]"
              aria-label={`Edit ${workstation.code}`}
            >
              <Pencil size={15} />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(workstation)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[var(--color-danger)]"
                aria-label={`Delete ${workstation.code}`}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1.5 text-sm text-slate-500">
        <p className="flex items-center gap-2">
          <Monitor size={14} className="text-slate-300" />
          {workstation.externalMonitor ? "External monitor available" : "No external monitor"}
        </p>
        <p className="flex items-center gap-2">
          <Zap size={14} className="text-slate-300" />
          {workstation.powerOutlets} outlet{workstation.powerOutlets === 1 ? "" : "s"} · UPS backup
        </p>
        <p className="flex items-center gap-2">
          <Wifi size={14} className="text-slate-300" />
          {workstation.internetMbps} Mbps dedicated
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
        <span className="font-mono-tight text-sm font-bold text-[var(--color-primary)]">
          ₦{workstation.dailyRate.toLocaleString()}/day
        </span>

        {onStatusChange ? (
          <select
            value={workstation.status}
            onChange={(e) => onStatusChange(workstation.id, e.target.value)}
            className="rounded-full border-0 bg-slate-50 px-3 py-1 text-xs font-semibold font-mono-tight uppercase tracking-wide text-slate-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <Badge status={workstation.status} />
        )}
      </div>
    </div>
  );
}
