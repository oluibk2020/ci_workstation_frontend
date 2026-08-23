import { useState } from "react";
import { Plus, ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon } from "lucide-react";
import { useWallet } from "../../context/WalletContext";
import { WALLET_TRANSACTION_TYPE } from "../../utils/constants";
import DepositModal from "../../components/client/DepositModal";
import Button from "../../components/common/Button";

export default function WalletPage() {
  const { balance, transactions, deposit } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">My Wallet</h1>
        <p className="text-sm text-slate-500">Deposit funds anytime and pay for bookings from your balance.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-primary)] p-6 text-white sm:p-8">
        <div className="flex items-center gap-2 text-slate-300">
          <WalletIcon size={16} />
          <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide">Wallet balance</p>
        </div>
        <p className="mt-3 font-mono-tight text-4xl font-extrabold sm:text-5xl">
          ₦{balance.toLocaleString()}
        </p>
        <p className="mt-2 text-sm text-slate-400">This balance never expires — deposit whenever you like.</p>
        <Button onClick={() => setModalOpen(true)} className="mt-6">
          <Plus size={16} />
          Add funds
        </Button>
      </div>

      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
          Transaction history
        </p>

        {transactions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No transactions yet — add funds to get started.</p>
        ) : (
          <div className="mt-3 divide-y divide-[var(--color-line)]">
            {transactions.map((txn) => {
              const isDeposit = txn.type === WALLET_TRANSACTION_TYPE.DEPOSIT || txn.amount > 0;
              return (
                <div key={txn.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                        isDeposit
                          ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                          : "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                      }`}
                    >
                      {isDeposit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-primary)]">{txn.description}</p>
                      <p className="text-xs text-slate-400">{txn.date}</p>
                    </div>
                  </div>
                  <p
                    className={`font-mono-tight text-sm font-semibold ${
                      isDeposit ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                    }`}
                  >
                    {isDeposit ? "+" : "-"}₦{Math.abs(txn.amount).toLocaleString()}
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
