import { Link } from "react-router-dom";
import Logo from "../common/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { to: "/workstations", label: "Workstations" },
      { to: "/branches", label: "Branches" },
      { to: "/pricing", label: "Pricing" },
      { to: "/how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/login", label: "Log in" },
      { to: "/register", label: "Create account" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              A desk, a socket, and internet that doesn't drop. Bring your own laptop — we handle the rest.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono-tight text-xs font-semibold uppercase tracking-wider text-slate-400">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-slate-600 hover:text-[var(--color-accent)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--color-line)] pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Work Station. All rights reserved.</p>
          <p className="font-mono-tight">Lagos · Abuja · Port Harcourt</p>
        </div>
      </div>
    </footer>
  );
}
