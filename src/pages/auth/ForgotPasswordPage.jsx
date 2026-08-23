import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: wire to authService.forgotPassword(email)
    setSent(true);
  }

  if (sent) {
    return (
      <>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Check your email</h1>
        <p className="mt-2 text-sm text-slate-500">
          If an account exists for <span className="font-medium text-slate-700">{email}</span>, a reset
          link is on its way.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline">
          ← Back to login
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-xl font-bold text-[var(--color-primary)]">Reset your password</h1>
      <p className="mt-1 text-sm text-slate-500">Enter your email and we'll send you a reset link.</p>

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
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>

      <Link to="/login" className="mt-6 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline">
        ← Back to login
      </Link>
    </>
  );
}
