import { apiFetch } from "./api";

// Not yet called by WalletContext (which is mocked). Wire these up once
// the real backend's Wallet + Paystack integration exists.
//
// Endpoint confirmed by the Testing/Deployment/Maintenance Guide §2:
// POST /api/v1/wallet/fund. A deposit must be verified server-side with
// Paystack before the balance is credited — never trust a client-side
// "succeeded" flag (same guide, §10).
//
// Cash funding (Super Admin credits a wallet for an authorized in-person
// payment) is also in scope, per the backend's frozen documentation
// (Testing/Deployment/Maintenance Guide §24). See WalletContext's
// `creditUserWallet` for the mocked implementation, and
// docs/BACKEND_ALIGNMENT.md §4 for the decision history.
export const walletService = {
  getBalance: () => apiFetch("/wallet"),
  listTransactions: () => apiFetch("/wallet/transactions"),
  fund: (amount) => apiFetch("/wallet/fund", { method: "POST", body: { amount } }),
  // Super Admin only. Exact path not given by the docs shared so far —
  // this is a reasonable guess following their existing REST conventions;
  // confirm against the real API spec (Doc 4) once available.
  creditCashFunding: (userId, amount, reason) =>
    apiFetch(`/wallet/${userId}/cash-funding`, { method: "POST", body: { amount, reason } }),
};
