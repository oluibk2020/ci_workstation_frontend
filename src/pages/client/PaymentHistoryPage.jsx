import { useState, useEffect, useCallback } from "react";
import { Receipt } from "lucide-react";
import { paymentService } from "../../services/paymentService";
import Badge from "../../components/common/Badge";

/**
 * Distinct from the Wallet page's transaction list: these are Paystack
 * payment *attempts* (Payment records), including ones that never
 * successfully credited the wallet — useful for support/reference
 * (provider reference, channel) even when a payment failed.
 */
export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await paymentService.list();
      setPayments(result.payments || []);
    } catch (err) {
      setError(err.message || "Couldn't load your payment history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return (
      <p className="text-sm text-slate-400">Loading your payment history...</p>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">
          Payment History
        </h1>
        <p className="text-sm text-slate-500">
          Every wallet-funding attempt via Paystack, including ones that didn't
          complete. For money actually credited or debited, see your{" "}
          <a
            href="/client/wallet"
            className="text-[var(--color-accent)] hover:underline"
          >
            Wallet
          </a>
          .
        </p>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {payments.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-16 text-center">
          <Receipt size={28} className="text-slate-300" />
          <p className="text-sm text-slate-500">No payment attempts yet.</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
        {payments.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] p-4 last:border-b-0"
          >
            <div>
              <p className="font-medium text-[var(--color-primary)]">
                ₦{Number(p.amount).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">
                {p.provider} · {p.providerReference}
                {p.channel && ` · ${p.channel}`}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(p.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge status={p.status}>{p.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
