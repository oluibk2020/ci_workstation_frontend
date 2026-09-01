import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { walletService } from "../services/walletService";

/**
 * WalletContext
 * -------------
 * Reads (balance, transaction history) are wired to the real backend and
 * confirmed working (GET /wallet, GET /wallet/transactions).
 *
 * Funding is NOT live yet — deliberately. Actually crediting a wallet
 * requires either:
 *   (a) a real Paystack flow — this account has no PAYSTACK_SECRET_KEY
 *       configured, and even once it is, their webhook can only just now
 *       reach the credit step after this session's backend patches; or
 *   (b) cash funding — no endpoint exists anywhere on their backend for
 *       this (see docs/BACKEND_CODE_REVIEW.md §2).
 * `deposit` below throws rather than silently pretending to work — no
 * more mock-only balance changes now that this reads real data, since a
 * fake local deposit would drift from what GET /wallet actually reports.
 */

const WalletContext = createContext(null);

function normalizeTransaction(t) {
  return { ...t, amount: Number(t.amount), balanceBefore: Number(t.balanceBefore), balanceAfter: Number(t.balanceAfter) };
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

  // Not implemented — see header note. Throws instead of silently faking
  // a balance change, so calling code has to handle the real "not
  // available yet" state rather than showing a number that isn't real.
  const deposit = useCallback(() => {
    throw new Error(
      "Wallet funding isn't connected yet — Paystack keys aren't configured, and cash funding has no backend endpoint."
    );
  }, []);

  const value = { balance, transactions, isLoading, error, reload, deposit };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
