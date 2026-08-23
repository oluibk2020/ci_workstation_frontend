import { Link } from "react-router-dom";

export default function Logo({ dark = false, to = "/" }) {
  return (
    <Link to={to} className="flex items-center gap-2 shrink-0">
      <span
        className={`grid h-8 w-8 place-items-center rounded-md font-mono-tight text-sm font-bold ${
          dark ? "bg-white text-[var(--color-primary)]" : "bg-[var(--color-primary)] text-white"
        }`}
      >
        WS
      </span>
      <span className={`text-[15px] font-bold tracking-tight ${dark ? "text-white" : "text-[var(--color-primary)]"}`}>
        Work Station
      </span>
    </Link>
  );
}
