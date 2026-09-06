import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Modal from "../common/Modal";
import Button from "../common/Button";

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000];

/**
 * NEW — email field. Requested directly: Paystack requires an email to
 * initialize a payment (it's where the receipt goes), and there was
 * previously no way to provide one at all on this end — the backend
 * silently relied on the account's own login email, which turned out to
 * be a real bug (req.user never actually carried it — see
 * authMiddleware.js). Pre-filled with the account email as a sensible
 * default, but editable — someone may want a receipt somewhere other
 * than their login address.
 */
export default function DepositModal({ open, onClose, onDeposit }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setEmail(user?.email || "");
  }, [open, user?.email]);

  function handleQuickPick(value) {
    setAmount(String(value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;
    if (!email.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await onDeposit(value, email.trim());
      setAmount("");
      onClose();
    } catch (err) {
      setError(err.message || "Couldn't process that deposit.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add funds via Paystack">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Quick amounts
          </label>
          <div className="mt-1.5 grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleQuickPick(value)}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold font-mono-tight transition-colors ${
                  Number(amount) === value
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "border-[var(--color-line)] text-slate-500 hover:border-slate-300"
                }`}
              >
                ₦{value.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Or enter an amount (₦)
          </label>
          <input
            type="number"
            min="100"
            step="100"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="e.g. 15000"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Receipt email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="you@example.com"
          />
          <p className="mt-1 text-xs text-slate-400">
            Paystack sends your payment receipt here. Defaults to your account
            email — change it if you'd rather use a different one for this
            payment.
          </p>
        </div>

        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Your wallet balance never expires — deposit as much or as little as
          you like, whenever you like.
        </p>

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !amount || !email}>
            {submitting
              ? "Processing..."
              : `Add ₦${amount ? Number(amount).toLocaleString() : "0"}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
