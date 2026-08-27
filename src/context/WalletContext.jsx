import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { WALLET_TRANSACTION_TYPE } from "../utils/constants";

/**
 * WalletContext
 * -------------
 * A plain cash balance for the logged-in Client, funded by deposits at any
 * time. No hours, no plans, no expiry — deposit money in, spend money on
 * bookings out, balance persists indefinitely.
 *
 * IMPORTANT (per backend spec §5.4, §5.1): the wallet is not one option
 * among several at checkout — it is the ONLY way a booking gets paid for.
 * Money enters the wallet exactly two ways: Paystack online funding
 * (`deposit`), or a Super Admin cash-funding credit (`creditUserWallet`).
 * A booking always debits the wallet (`pay`); if the balance is
 * insufficient, the booking fails — there is no "pay directly instead"
 * fallback.
 *
 * Mocked for now via localStorage, keyed per user id. Swap `deposit` and
 * `pay` for real calls to services/walletService.js once the backend and
 * Paystack are wired up — a deposit must be verified server-side before
 * the balance is credited, never on the strength of a client-side
 * "succeeded" flag.
 */

const WalletContext = createContext(null);

function storageKey(userId) {
  return `workstation.wallet.${userId}`;
}

function seedTransactions() {
  return [
    {
      id: "txn-seed-2",
      type: WALLET_TRANSACTION_TYPE.BOOKING_DEBIT,
      amount: -24000,
      description: "Booking WS-04, Sagamu (3 days)",
      date: "2026-08-18",
    },
    {
      id: "txn-seed-1",
      type: WALLET_TRANSACTION_TYPE.DEPOSIT,
      amount: 50000,
      description: "Wallet top-up via Paystack",
      date: "2026-08-10",
    },
  ];
}

function readWallet(userId) {
  const stored = localStorage.getItem(storageKey(userId));
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function writeWallet(userId, balance, transactions) {
  localStorage.setItem(storageKey(userId), JSON.stringify({ balance, transactions }));
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

    const stored = readWallet(user.id);
    if (stored) {
      setBalance(stored.balance ?? 0);
      setTransactions(stored.transactions ?? []);
      hydrated.current = true;
      return;
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
    writeWallet(user.id, balance, transactions);
  }, [user, balance, transactions]);

  // Online funding via Paystack.
  const deposit = useCallback((amount) => {
    const value = Math.abs(Number(amount) || 0);
    const txn = {
      id: `txn-${Date.now()}`,
      type: WALLET_TRANSACTION_TYPE.DEPOSIT,
      amount: value,
      description: "Wallet top-up via Paystack",
      date: new Date().toISOString().slice(0, 10),
    };
    setBalance((b) => b + value);
    setTransactions((prev) => [txn, ...prev]);
    return txn;
  }, []);

  // Not yet wired to a real booking flow (Phase 3) — exposed so the
  // Booking feature can debit the wallet once built. Per the backend spec
  // this is the ONLY way a booking is paid for; there is no alternative
  // "pay by card at checkout" path.
  const pay = useCallback((amount, description) => {
    const value = Math.abs(Number(amount) || 0);
    const txn = {
      id: `txn-${Date.now()}`,
      type: WALLET_TRANSACTION_TYPE.BOOKING_DEBIT,
      amount: -value,
      description,
      date: new Date().toISOString().slice(0, 10),
    };
    setBalance((b) => b - value);
    setTransactions((prev) => [txn, ...prev]);
    return txn;
  }, []);

  // Cancelling a future, unused booking date never refunds cash — it
  // credits the wallet with the date's original value, non-withdrawable,
  // usable only for future bookings (backend spec §5.1, §5.2).
  const creditCancellation = useCallback((amount, description) => {
    const value = Math.abs(Number(amount) || 0);
    const txn = {
      id: `txn-${Date.now()}`,
      type: WALLET_TRANSACTION_TYPE.CANCELLATION_CREDIT,
      amount: value,
      description,
      date: new Date().toISOString().slice(0, 10),
    };
    setBalance((b) => b + value);
    setTransactions((prev) => [txn, ...prev]);
    return txn;
  }, []);

  // Super Admin only — credits an ARBITRARY user's wallet (not necessarily
  // the currently logged-in one) for an authorized cash payment (backend
  // spec §4.3, §8.2). Operates directly on that user's storage slot since
  // WalletContext otherwise only tracks the active session's own wallet.
  const creditUserWallet = useCallback((userId, amount, reason = "Cash payment") => {
    const value = Math.abs(Number(amount) || 0);
    const existing = readWallet(userId) || { balance: 0, transactions: [] };
    const txn = {
      id: `txn-${Date.now()}`,
      type: WALLET_TRANSACTION_TYPE.CASH_FUNDING,
      amount: value,
      description: reason,
      date: new Date().toISOString().slice(0, 10),
    };
    const updated = {
      balance: existing.balance + value,
      transactions: [txn, ...existing.transactions],
    };
    writeWallet(userId, updated.balance, updated.transactions);

    // If crediting the currently logged-in user, reflect it immediately.
    if (user?.id === userId) {
      setBalance(updated.balance);
      setTransactions(updated.transactions);
    }
    return txn;
  }, [user]);

  const value = { balance, transactions, deposit, pay, creditCancellation, creditUserWallet };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
