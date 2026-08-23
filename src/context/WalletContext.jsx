import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { WALLET_TRANSACTION_TYPE } from "../utils/constants";

/**
 * WalletContext
 * -------------
 * A plain cash balance for the logged-in Client, funded by deposits at any
 * time. This is NOT the old Hour Wallet / subscription-bundle model removed
 * in Revision 4 — there are no hours, no plans, and no expiry. It's simply:
 * deposit money in, spend money on bookings out, balance persists
 * indefinitely.
 *
 * Mocked for now via localStorage, keyed per user id. Swap `deposit` and
 * `pay` for real calls to services/walletService.js once the backend and a
 * payment provider are wired up — per docs Section 22, a deposit must be
 * verified server-side before the balance is credited, the same way a
 * direct booking payment is.
 */

const WalletContext = createContext(null);

function storageKey(userId) {
  return `workstation.wallet.${userId}`;
}

function seedTransactions() {
  return [
    {
      id: "txn-seed-2",
      type: WALLET_TRANSACTION_TYPE.PAYMENT,
      amount: -24000,
      description: "Booking WS-04, Sagamu (3 days)",
      date: "2026-08-18",
    },
    {
      id: "txn-seed-1",
      type: WALLET_TRANSACTION_TYPE.DEPOSIT,
      amount: 50000,
      description: "Wallet top-up via card",
      date: "2026-08-10",
    },
  ];
}

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const hydrated = useRef(false);

  // Load (or seed) this user's wallet whenever who's logged in changes.
  useEffect(() => {
    hydrated.current = false;
    if (!user) {
      setBalance(0);
      setTransactions([]);
      return;
    }

    const stored = localStorage.getItem(storageKey(user.id));
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setBalance(parsed.balance ?? 0);
        setTransactions(parsed.transactions ?? []);
        hydrated.current = true;
        return;
      } catch {
        // fall through to seed
      }
    }

    const seed = seedTransactions();
    setBalance(seed.reduce((sum, t) => sum + t.amount, 0));
    setTransactions(seed);
    hydrated.current = true;
  }, [user]);

  // Persist on every change, once initial hydration has happened (avoids
  // clobbering storage with the pre-hydration 0/[] state).
  useEffect(() => {
    if (!user || !hydrated.current) return;
    localStorage.setItem(storageKey(user.id), JSON.stringify({ balance, transactions }));
  }, [user, balance, transactions]);

  const deposit = useCallback((amount, method = "Card") => {
    const value = Math.abs(Number(amount) || 0);
    const txn = {
      id: `txn-${Date.now()}`,
      type: WALLET_TRANSACTION_TYPE.DEPOSIT,
      amount: value,
      description: `Wallet top-up via ${method}`,
      date: new Date().toISOString().slice(0, 10),
    };
    setBalance((b) => b + value);
    setTransactions((prev) => [txn, ...prev]);
    return txn;
  }, []);

  // Not yet wired to a real booking flow (Phase 3) — exposed so the
  // Booking feature can debit the wallet as a payment method once built.
  const pay = useCallback((amount, description) => {
    const value = Math.abs(Number(amount) || 0);
    const txn = {
      id: `txn-${Date.now()}`,
      type: WALLET_TRANSACTION_TYPE.PAYMENT,
      amount: -value,
      description,
      date: new Date().toISOString().slice(0, 10),
    };
    setBalance((b) => b - value);
    setTransactions((prev) => [txn, ...prev]);
    return txn;
  }, []);

  const value = { balance, transactions, deposit, pay };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
