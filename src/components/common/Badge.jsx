import { STATUS_STYLES } from "../../utils/constants";

/**
 * Status badge. Always pair color with a text label (never color alone) —
 * see docs Section 19, Accessible status indicators.
 */
export default function Badge({ status, children, className = "" }) {
  const style = STATUS_STYLES[status] || "bg-slate-200 text-slate-600";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold font-mono-tight uppercase tracking-wide ${style} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current status-dot" />
      {children || status}
    </span>
  );
}
