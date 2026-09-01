import { useState } from "react";
import { Plus, ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon, Loader2 } from "lucide-react";
import { useWallet } from "../../context/WalletContext";
import DepositModal from "../../components/client/DepositModal";
import Button from "../../components/common/Button";

export default function WalletPage() {
  const { balance, transactions, isLoading, error, deposit } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">My Wallet</h1>
        <p className="text-sm text-slate-500">Fund anytime and pay for bookings from your balance.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-primary)] p-6 text-white sm:p-8">
        <div className="flex items-center gap-2 text-slate-300">
          <WalletIcon size={16} />
          <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide">Wallet balance</p>
        </div>
        <p className="mt-3 font-mono-tight text-4xl font-extrabold sm:text-5xl">
          {isLoading ? <Loader2 className="animate-spin" size={36} /> : `₦${balance.toLocaleString()}`}
        </p>
        <p className="mt-2 text-sm text-slate-400">This balance never expires.</p>
        <Button onClick={() => setModalOpen(true)} className="mt-6">
          <Plus size={16} />
          Add funds
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
          Transaction history
        </p>

        {isLoading ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={14} className="animate-spin" /> Loading...
          </p>
        ) : transactions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No transactions yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-[var(--color-line)]">
            {transactions.map((txn) => {
              const isCredit = txn.direction === "CREDIT";
              return (
                <div key={txn.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                        isCredit
                          ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                          : "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-primary)]">
                        {txn.description || txn.type}
                      </p>
                      <p className="text-xs text-slate-400">
                        {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-mono-tight text-sm font-semibold ${
                      isCredit ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                    }`}
                  >
                    {isCredit ? "+" : "-"}₦{Math.abs(txn.amount).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DepositModal open={modalOpen} onClose={() => setModalOpen(false)} onDeposit={deposit} />
    </div>
  );
}
