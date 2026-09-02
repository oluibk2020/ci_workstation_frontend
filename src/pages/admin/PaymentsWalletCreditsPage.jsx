import { useState, useEffect, useCallback } from "react";
import { CreditCard } from "lucide-react";
import Badge from "../../components/common/Badge";
import { paymentService } from "../../services/paymentService";
import { walletService } from "../../services/walletService";

export default function PaymentsWalletCreditsPage() {
  const [tab, setTab] = useState("payments"); // "payments" | "cash"
  const [payments, setPayments] = useState([]);
  const [cashCredits, setCashCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [paymentsResult, cashResult] = await Promise.all([
        paymentService.listAll(),
        walletService.getCashFundingHistory(),
      ]);
      setPayments(paymentsResult.payments || []);
      setCashCredits(cashResult.transactions || []);
    } catch (err) {
      setError(err.message || "Couldn't load payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Payments & Wallet Credits</h1>
        <p className="text-sm text-slate-500">Every Paystack attempt and every cash credit issued, across all clients.</p>
      </div>

      <div className="flex gap-2">
        {[
          { key: "payments", label: `Paystack payments (${payments.length})` },
          { key: "cash", label: `Cash credits (${cashCredits.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-[var(--color-primary)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {tab === "payments" ? (
        payments.length === 0 ? (
          <EmptyState label="No Paystack payment attempts yet." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
            {payments.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] p-4 last:border-b-0">
                <div>
                  <p className="font-medium text-[var(--color-primary)]">{p.user.name}</p>
                  <p className="text-xs text-slate-400">
                    ₦{Number(p.amount).toLocaleString()} · {p.provider} · {p.providerReference}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleString()}</p>
                </div>
                <Badge status={p.status}>{p.status}</Badge>
              </div>
            ))}
          </div>
        )
      ) : cashCredits.length === 0 ? (
        <EmptyState label="No cash credits issued yet." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
          {cashCredits.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] p-4 last:border-b-0">
              <div>
                <p className="font-medium text-[var(--color-primary)]">{c.user.name}</p>
                <p className="text-xs text-slate-400">{c.description}</p>
                <p className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</p>
              </div>
              <p className="font-mono-tight font-semibold text-[var(--color-success)]">
                +₦{Number(c.amount).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-16 text-center">
      <CreditCard size={28} className="text-slate-300" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
