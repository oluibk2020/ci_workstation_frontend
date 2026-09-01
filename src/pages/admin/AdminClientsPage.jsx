import { useState, useEffect, useCallback } from "react";
import { Search, ShieldCheck, ShieldOff, Ban, RotateCcw, Loader2 } from "lucide-react";
import { adminUserService } from "../../services/adminUserService";
import { useAuth } from "../../context/AuthContext";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { ROLES, USER_STATUS } from "../../utils/constants";

// Wired to the real backend — GET/PATCH /api/v1/admin/users (confirmed
// working set of endpoints; see docs/BACKEND_CODE_REVIEW.md). Wallet cash
// crediting was intentionally dropped from this page: their schema
// supports a CASH_FUNDING ledger type, but no endpoint anywhere
// implements it yet (see docs/PATCH_NOTES.md) — nothing real to wire it to.
export default function AdminClientsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);

  const loadUsers = useCallback(async (search) => {
    setIsLoading(true);
    setError("");
    try {
      const { users: list } = await adminUserService.list({ search });
      setUsers(list);
    } catch (err) {
      setError(err.message || "Couldn't load users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadUsers(query), 300);
    return () => clearTimeout(timeout);
  }, [query, loadUsers]);

  async function handleRoleChange(userId, role) {
    setBusyUserId(userId);
    try {
      const { user: updated } = await adminUserService.updateRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
    } catch (err) {
      setError(err.message || "Couldn't update role.");
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleStatusChange(userId, status) {
    setBusyUserId(userId);
    try {
      const { user: updated } = await adminUserService.updateStatus(userId, status);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
    } catch (err) {
      setError(err.message || "Couldn't update status.");
    } finally {
      setBusyUserId(null);
    }
  }

  const rows = users.filter((u) => u.role !== ROLES.ADMIN);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Clients</h1>
        <p className="text-sm text-slate-500">
          Everyone signs up as a Client. Promote someone to Staff here if they need to verify QR
          codes and check people in, or ban an account that's misusing the platform.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 sm:max-w-sm">
        <Search size={16} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Verification</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {rows.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3 font-medium text-[var(--color-primary)]">{u.name}</td>
                <td className="px-5 py-3 text-slate-500">{u.email}</td>
                <td className="px-5 py-3">
                  <Badge status={u.role === ROLES.MANAGER ? "VERIFIED" : "BOOKED"}>{u.role}</Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge status={u.status === USER_STATUS.BANNED ? "BANNED" : "ACTIVE"}>{u.status}</Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge status={u.verificationStatus}>{u.verificationStatus}</Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    {u.id !== currentUser?.id && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyUserId === u.id}
                          onClick={() =>
                            handleStatusChange(u.id, u.status === USER_STATUS.BANNED ? USER_STATUS.ACTIVE : USER_STATUS.BANNED)
                          }
                        >
                          {busyUserId === u.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : u.status === USER_STATUS.BANNED ? (
                            <RotateCcw size={14} />
                          ) : (
                            <Ban size={14} />
                          )}
                          {u.status === USER_STATUS.BANNED ? "Reactivate" : "Ban"}
                        </Button>
                        {u.role === ROLES.CLIENT ? (
                          <Button size="sm" variant="outline" disabled={busyUserId === u.id} onClick={() => handleRoleChange(u.id, ROLES.MANAGER)}>
                            <ShieldCheck size={14} />
                            Make Staff
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" disabled={busyUserId === u.id} onClick={() => handleRoleChange(u.id, ROLES.CLIENT)}>
                            <ShieldOff size={14} />
                            Revert to Client
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading && <p className="p-5 text-sm text-slate-400">Loading...</p>}
        {!isLoading && rows.length === 0 && <p className="p-5 text-sm text-slate-400">No accounts match your search.</p>}
      </div>
    </div>
  );
}
