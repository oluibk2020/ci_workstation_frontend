import { useState, useEffect, useCallback } from "react";
import { ShieldOff, Users } from "lucide-react";
import { adminUserService } from "../../services/adminUserService";
import { useAuth } from "../../context/AuthContext";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { ROLES } from "../../utils/constants";

/**
 * A filtered view of the same real user data behind Admin > Clients,
 * scoped to STAFF only — no new backend endpoint needed, just
 * adminUserService.list({ role: "STAFF" }), which was already confirmed
 * working. Reuses the same revert-to-client action already built.
 */
export default function StaffPage() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminUserService.list({ role: "STAFF", limit: 100 });
      setStaff(result.users || []);
    } catch (err) {
      setError(err.message || "Couldn't load staff.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRevert(userId) {
    setBusyUserId(userId);
    try {
      await adminUserService.updateRole(userId, ROLES.CLIENT);
      setStaff((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err.message || "Couldn't revert this account.");
    } finally {
      setBusyUserId(null);
    }
  }

  if (loading) return <p className="text-sm text-slate-400">Loading staff...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Staff</h1>
        <p className="text-sm text-slate-500">
          Everyone with permission to verify QR codes and check people in. Promote someone here from{" "}
          <a href="/admin/clients" className="text-[var(--color-accent)] hover:underline">
            Clients
          </a>
          .
        </p>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {staff.length === 0 && !error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-16 text-center">
          <Users size={28} className="text-slate-300" />
          <p className="text-sm text-slate-500">No staff members yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-white">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {staff.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3 font-medium text-[var(--color-primary)]">{u.name}</td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <Badge status={u.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.id !== currentUser?.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRevert(u.id)}
                        disabled={busyUserId === u.id}
                      >
                        <ShieldOff size={14} />
                        Revert to Client
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
