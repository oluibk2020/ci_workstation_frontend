import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { walletService } from "../services/walletService";
import { paymentService } from "../services/paymentService";

/**
 * WalletContext
 * -------------
 * Reads (balance, transaction history) are wired to the real backend and
 * confirmed working (GET /wallet, GET /wallet/transactions).
 *
 * Funding is now real. `deposit(amount)` calls the real
 * POST /payments/initialize and redirects the browser to Paystack's own
 * checkout page — there is no in-app "success" state to show here, since
 * the tab navigates away entirely. See PaymentCallbackPage.jsx for what
 * happens when the browser comes back.
 */

const WalletContext = createContext(null);

function normalizeTransaction(t) {
  return {
    ...t,
    amount: Number(t.amount),
    balanceBefore: Number(t.balanceBefore),
    balanceAfter: Number(t.balanceAfter),
  };
}

export function WalletProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setBalance(0);
      setTransactions([]);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const [{ wallet }, { transactions: txns }] = await Promise.all([
        walletService.getBalance(),
        walletService.listTransactions(),
      ]);
      setBalance(Number(wallet.balance));
      setTransactions(txns.map(normalizeTransaction));
    } catch (err) {
      setError(err.message || "Couldn't load your wallet.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    reload();
  }, [reload, user?.id]);

  // Redirects the whole tab to Paystack's hosted checkout — there's
  // nothing further for the caller to do once this resolves, since the
  // browser navigates away before any "success" state could be shown
  // here. PaymentCallbackPage handles what happens when it comes back.
  const deposit = useCallback(async (amount, email) => {
    const result = await paymentService.initialize(amount, email);
    window.location.href = result.authorizationUrl;
  }, []);

  const value = { balance, transactions, isLoading, error, reload, deposit };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
