import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000];

export default function DepositModal({ open, onClose, onDeposit }) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleQuickPick(value) {
    setAmount(String(value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;
    setSubmitting(true);
    setError("");
    try {
      await onDeposit(value);
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
          <label className="text-sm font-medium text-slate-700">Quick amounts</label>
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
          <label className="text-sm font-medium text-slate-700">Or enter an amount (₦)</label>
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

        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Your wallet balance never expires — deposit as much or as little as you like, whenever you
          like.
        </p>

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !amount}>
            {submitting ? "Processing..." : `Add ₦${amount ? Number(amount).toLocaleString() : "0"}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
