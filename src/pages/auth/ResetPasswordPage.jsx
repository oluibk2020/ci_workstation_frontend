import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/common/Button";
import { authService } from "../../services/authService";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!token) return setError("This reset link is invalid or expired. Please request a new one.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setError(err.message || "Couldn't reset your password. Please request a new link.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Password updated</h1>
        <p className="mt-2 text-sm text-slate-500">Your password has been reset. Taking you to login...</p>
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline">Go to login</Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-xl font-bold text-[var(--color-primary)]">Set a new password</h1>
      <p className="mt-1 text-sm text-slate-500">Choose a new password with at least 8 characters.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">New password</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Confirm password</label>
          <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none" />
        </div>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || !token}>{loading ? "Updating..." : "Reset password"}</Button>
      </form>
      <Link to="/login" className="mt-6 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline">← Back to login</Link>
    </>
  );
}
