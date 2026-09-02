import { useState, useEffect, useCallback } from "react";
import { Search, ShieldCheck, ShieldOff, Ban, RotateCcw, Loader2, Wallet } from "lucide-react";
import { adminUserService } from "../../services/adminUserService";
import { useAuth } from "../../context/AuthContext";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { ROLES, USER_STATUS } from "../../utils/constants";

// Wired to the real backend — GET/PATCH /api/v1/admin/users (confirmed
// working set of endpoints; see docs/BACKEND_CODE_REVIEW.md). Cash
// crediting is now real too — see docs/PATCH_NOTES.md's fifth pass —
// reusing the real walletService.creditWallet on the backend.
export default function AdminClientsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);

  const [creditingUser, setCreditingUser] = useState(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditedAmount, setCreditedAmount] = useState(0);
  const [creditReason, setCreditReason] = useState("");
  const [creditSubmitting, setCreditSubmitting] = useState(false);
  const [creditError, setCreditError] = useState("");
  const [creditSuccess, setCreditSuccess] = useState(false);

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

  function openCreditModal(user) {
    setCreditingUser(user);
    setCreditAmount("");
    setCreditedAmount(0);
    setCreditReason("");
    setCreditError("");
    setCreditSuccess(false);
  }

  async function handleCreditSubmit(e) {
    e.preventDefault();
    const amount = Number(creditAmount);
    if (!amount || amount <= 0) return;
    setCreditSubmitting(true);
    setCreditError("");
    try {
      await adminUserService.creditWallet(creditingUser.id, amount, creditReason.trim() || undefined);
      // BUG FIX: was showing the confirmation using `creditAmount` after
      // it had already been reset to "" on the next line — always showed
      // "₦0 credited successfully." regardless of what was actually sent.
      // The real backend call above always used the correct `amount`, so
      // this was purely a display bug, not a data problem.
      setCreditedAmount(amount);
      setCreditSuccess(true);
      setCreditAmount("");
      setCreditReason("");
    } catch (err) {
      setCreditError(err.message || "Couldn't credit this wallet.");
    } finally {
      setCreditSubmitting(false);
    }
  }

  const rows = users.filter((u) => u.role !== ROLES.ADMIN);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Clients</h1>
        <p className="text-sm text-slate-500">
          Everyone signs up as a Client. Promote someone to Staff here if they need to verify QR
          codes and check people in, ban an account that's misusing the platform, or credit a
          client's wallet for cash received in person.
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

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-white">
        <table className="w-full min-w-[800px] text-sm">
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
                        {u.role === ROLES.CLIENT && (
                          <Button size="sm" variant="ghost" onClick={() => openCreditModal(u)}>
                            <Wallet size={14} />
                            Credit Wallet
                          </Button>
                        )}
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

      <Modal open={!!creditingUser} onClose={() => setCreditingUser(null)} title={`Credit ${creditingUser?.name}'s wallet`}>
        {creditSuccess ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-[var(--color-success)]">
              ₦{creditedAmount.toLocaleString()} credited successfully.
            </p>
            <Button className="w-full" onClick={() => setCreditingUser(null)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreditSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Amount received in cash (₦)</label>
              <input
                type="number"
                min="100"
                step="100"
                required
                autoFocus
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                placeholder="e.g. 20000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Reason (optional)</label>
              <input
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                placeholder="e.g. Cash payment at front desk"
              />
            </div>
            <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              This is only for authorized cash payments already received in person. It creates a
              CASH_FUNDING ledger entry and is recorded against your account.
            </p>
            {creditError && <p className="text-sm text-[var(--color-danger)]">{creditError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setCreditingUser(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creditSubmitting}>
                {creditSubmitting ? "Crediting..." : "Credit wallet"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
