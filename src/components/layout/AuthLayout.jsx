import { Outlet, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "../common/Logo";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[var(--color-accent)]"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
