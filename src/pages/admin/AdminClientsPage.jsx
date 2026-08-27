import { useState, useMemo } from "react";
import { Search, ShieldCheck, ShieldOff, Wallet } from "lucide-react";
import { useUsers } from "../../context/UsersContext";
import { useWallet } from "../../context/WalletContext";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { ROLES } from "../../utils/constants";

export default function AdminClientsPage() {
  const { users, setRole } = useUsers();
  const { creditUserWallet } = useWallet();
  const [query, setQuery] = useState("");
  const [creditingUser, setCreditingUser] = useState(null);
  const [creditAmount, setCreditAmount] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => u.role !== ROLES.ADMIN)
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  function handleCreditSubmit(e) {
    e.preventDefault();
    const value = Number(creditAmount);
    if (!value || value <= 0 || !creditingUser) return;
    creditUserWallet(creditingUser.id, value, `Cash payment received in person, credited by admin`);
    setCreditingUser(null);
    setCreditAmount("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Clients</h1>
        <p className="text-sm text-slate-500">
          Everyone signs up as a Client. Promote someone to Staff here if they need to verify QR
          codes and check people in — there's no self-service way to become Staff. You can also
          credit a client's wallet for an authorized cash payment received in person.
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

      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
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
                  <Badge status={u.verificationStatus}>{u.verificationStatus}</Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    {u.role === ROLES.CLIENT && (
                      <Button size="sm" variant="ghost" onClick={() => setCreditingUser(u)}>
                        <Wallet size={14} />
                        Credit Wallet
                      </Button>
                    )}
                    {u.role === ROLES.CLIENT ? (
                      <Button size="sm" variant="outline" onClick={() => setRole(u.id, ROLES.MANAGER)}>
                        <ShieldCheck size={14} />
                        Make Staff
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setRole(u.id, ROLES.CLIENT)}>
                        <ShieldOff size={14} />
                        Revert to Client
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && <p className="p-5 text-sm text-slate-400">No accounts match your search.</p>}
      </div>

      <Modal open={!!creditingUser} onClose={() => setCreditingUser(null)} title={`Credit ${creditingUser?.name}'s wallet`}>
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
          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            This is only for authorized cash payments already received in person. It creates a
            CASH_FUNDING ledger entry and must be logged in the audit trail once the backend exists.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreditingUser(null)}>
              Cancel
            </Button>
            <Button type="submit">Credit wallet</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
