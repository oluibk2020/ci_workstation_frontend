import { useState, useMemo } from "react";
import { Search, ShieldCheck, ShieldOff } from "lucide-react";
import { useUsers } from "../../context/UsersContext";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { ROLES } from "../../utils/constants";

export default function AdminClientsPage() {
  const { users, setRole } = useUsers();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => u.role !== ROLES.ADMIN)
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Clients</h1>
        <p className="text-sm text-slate-500">
          Everyone signs up as a Client. Promote someone to Manager here if they need to run a
          location — there's no self-service way to become a Manager.
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
              <th className="px-5 py-3 text-right">Action</th>
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
                <td className="px-5 py-3 text-right">
                  {u.role === ROLES.CLIENT ? (
                    <Button size="sm" variant="outline" onClick={() => setRole(u.id, ROLES.MANAGER)}>
                      <ShieldCheck size={14} />
                      Make Manager
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setRole(u.id, ROLES.CLIENT)}>
                      <ShieldOff size={14} />
                      Revert to Client
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && <p className="p-5 text-sm text-slate-400">No accounts match your search.</p>}
      </div>
    </div>
  );
}
