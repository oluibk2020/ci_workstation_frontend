import { Pencil, Trash2 } from "lucide-react";
import Badge from "../common/Badge";
import { SEAT_STATUS } from "../../utils/constants";

const STATUS_OPTIONS = Object.values(SEAT_STATUS);

export default function SeatCard({ seat, workstationName, branchName, pricePerDay, onEdit, onDelete, onStatusChange, canManage = true }) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
            {seat.seatId} · {branchName}
          </p>
          <p className="mt-1 font-semibold text-[var(--color-primary)]">{workstationName}</p>
        </div>
        {canManage && onEdit && (
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(seat)}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[var(--color-accent)]"
              aria-label={`Edit seat ${seat.seatId}`}
            >
              <Pencil size={15} />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(seat)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[var(--color-danger)]"
                aria-label={`Delete seat ${seat.seatId}`}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
        <span className="font-mono-tight text-sm font-bold text-[var(--color-primary)]">
          ₦{pricePerDay.toLocaleString()}/day
        </span>

        {onStatusChange ? (
          <select
            value={seat.status}
            onChange={(e) => onStatusChange(seat.id, e.target.value)}
            className="rounded-full border-0 bg-slate-50 px-3 py-1 text-xs font-semibold font-mono-tight uppercase tracking-wide text-slate-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <Badge status={seat.status} />
        )}
      </div>
    </div>
  );
}
