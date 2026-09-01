import { apiFetch } from "./api";

/**
 * Not yet called by WalletContext (which is mocked).
 *
 * IMPORTANT — corrects an earlier guess: there is no `/wallet/fund`
 * endpoint. Confirmed from their actual routes/services: wallet.js only
 * exposes read operations (getWallet, getTransactions). Funding is a
 * Payments concern, not a Wallet one — see paymentService.js. The wallet
 * only gets credited as a *side effect* of a verified Paystack payment.
 *
 * Cash funding (Super Admin credits a wallet for an in-person payment) is
 * modeled in their schema (CASH_FUNDING ledger type) but has NO endpoint
 * anywhere in their current codebase — see docs/BACKEND_CODE_REVIEW.md §2.
 * `creditCashFunding` below is a placeholder guess at a path following
 * their existing REST conventions; there is nothing to confirm it against
 * yet, unlike everything else in this file.
 */
export const walletService = {
  getBalance: () => apiFetch("/wallet"),
  listTransactions: () => apiFetch("/wallet/transactions"),
  // Unconfirmed guess — no real endpoint exists for this yet (see note above).
  creditCashFunding: (userId, amount, reason) =>
    apiFetch(`/wallet/${userId}/cash-funding`, { method: "POST", body: { amount, reason } }),
};
