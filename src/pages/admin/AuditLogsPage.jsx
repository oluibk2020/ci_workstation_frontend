import { useState, useEffect, useCallback } from "react";
import { FileClock } from "lucide-react";
import { auditLogService } from "../../services/auditLogService";

const ACTION_LABELS = {
  USER_STATUS_CHANGED: "Account status changed",
  USER_ROLE_CHANGED: "Role changed",
  WALLET_CASH_CREDITED: "Wallet credited (cash)",
  VERIFICATION_APPROVED: "Verification approved",
  VERIFICATION_REJECTED: "Verification rejected",
};

/**
 * The AuditLog table existed in the schema all along, but nothing ever
 * wrote to it before this session — see docs/PATCH_NOTES.md. Currently
 * only covers the four actions instrumented so far (ban/unban, role
 * change, cash credit, verification review). Other admin actions
 * (branch/workstation/seat CRUD, cancellations, reassignments) aren't
 * logged yet — a natural next addition, not attempted here.
 */
export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await auditLogService.list({ limit: 50 });
      setLogs(result.logs || []);
    } catch (err) {
      setError(err.message || "Couldn't load audit logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-sm text-slate-400">Loading audit logs...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Audit Logs</h1>
        <p className="text-sm text-slate-500">
          Account status/role changes, cash credits, and verification decisions. Catalog changes
          (branches, workstations, seats) and bookings aren't logged here yet.
        </p>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {logs.length === 0 && !error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-16 text-center">
          <FileClock size={28} className="text-slate-300" />
          <p className="text-sm text-slate-500">Nothing logged yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] p-4 last:border-b-0">
              <div>
                <p className="font-medium text-[var(--color-primary)]">{ACTION_LABELS[log.action] || log.action}</p>
                <p className="text-xs text-slate-400">
                  {log.actor ? `by ${log.actor.name}` : "System"} · {log.entityType}
                  {log.metadata && ` · ${JSON.stringify(log.metadata)}`}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
