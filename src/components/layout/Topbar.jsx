import { Menu, Search, Bell } from "lucide-react";
import Badge from "../common/Badge";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

export default function Topbar({ onMenuClick }) {
  const { user, role, verificationStatus } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[var(--color-line)] bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="hidden items-center gap-2 rounded-lg border border-[var(--color-line)] bg-slate-50 px-3 py-2 sm:flex">
          <Search size={16} className="text-slate-400" />
          <input
            placeholder="Search..."
            className="w-56 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {role === ROLES.CLIENT && <Badge status={verificationStatus}>{verificationStatus}</Badge>}

        <button
          className="relative grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
        </button>

        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="hidden text-sm font-medium text-slate-700 sm:block">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
