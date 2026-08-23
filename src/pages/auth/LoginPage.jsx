import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { dashboardPathForRole } from "../../utils/roleRouting";
import Button from "../../components/common/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login({ email, password });
      const redirectTo = location.state?.from?.pathname || dashboardPathForRole(user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err?.code === "NO_ACCOUNT"
          ? "We couldn't find an account with that email. Create one below."
          : "Couldn't log you in. Check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-xl font-bold text-[var(--color-primary)]">Log in</h1>
      <p className="mt-1 text-sm text-slate-500">Welcome back — book your next desk in a minute.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-[var(--color-accent)] hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-[var(--color-accent)] hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
}
