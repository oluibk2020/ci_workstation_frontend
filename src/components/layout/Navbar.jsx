import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "../common/Logo";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext";
import { dashboardPathForRole } from "../../utils/roleRouting";

const LINKS = [
  { to: "/workstations", label: "Workstations" },
  { to: "/branches", label: "Branches" },
  { to: "/pricing", label: "Pricing" },
  { to: "/how-it-works", label: "How it works" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, role } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-[var(--color-accent)]" : "text-slate-600 hover:text-[var(--color-primary)]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Button as={Link} to={dashboardPathForRole(role)} variant="dark" size="sm">
              Dashboard
            </Button>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button as={Link} to="/register" variant="primary" size="sm">
                Get started
              </Button>
            </>
          )}
        </div>

        <button
          className="grid h-9 w-9 place-items-center rounded-md text-slate-600 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-[var(--color-line)] bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-700"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[var(--color-line)] pt-4">
              {isAuthenticated ? (
                <Button as={Link} to={dashboardPathForRole(role)} variant="dark" size="sm">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="outline" size="sm">
                    Log in
                  </Button>
                  <Button as={Link} to="/register" variant="primary" size="sm">
                    Get started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
