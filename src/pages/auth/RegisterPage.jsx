import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/client/dashboard", { replace: true });
    } catch (err) {
      // Their error middleware is a stub (see docs/BACKEND_CODE_REVIEW.md
      // §6) — a duplicate email throws "Unable to create account." on
      // their end, but it never reaches here: it's swallowed into a
      // generic 500 with no real message. Validation errors (missing
      // fields, short password) DO come through properly via their
      // validator layer, so those still show accurately.
      setError(
        err?.isGenericServerError
          ? "Couldn't create your account — this email may already be registered."
          : err.message || "Something went wrong creating your account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-xl font-bold text-[var(--color-primary)]">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Bring your laptop. We'll get you a desk, power and internet.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <input
            required
            value={form.name}
            onChange={update("name")}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="Ada Obi"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={update("password")}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <p className="rounded-lg bg-[var(--color-warning)]/10 p-3 text-xs text-amber-700">
          New accounts start as <span className="font-mono-tight font-semibold">UNVERIFIED</span>.
          Submit a profile photo and ID document from your profile before your first visit — it
          needs to be reviewed and approved before first-time physical access is allowed.
        </p>

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-[var(--color-accent)] hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
