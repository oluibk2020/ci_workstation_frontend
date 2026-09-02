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
 * Cash funding is real and confirmed — but the actual endpoint is
 * `POST /admin/users/:userId/wallet-credit` (see adminUserService.js's
 * `creditWallet`), not `/wallet/:userId/cash-funding` as an earlier
 * placeholder guess here suggested. That unused guess has been removed.
 */
export const walletService = {
  getBalance: () => apiFetch("/wallet"),
  listTransactions: () => apiFetch("/wallet/transactions"),
  // Super Admin only — cross-user log of every cash-funding credit issued,
  // for the "Payments & Wallet Credits" admin page.
  getCashFundingHistory: ({ page, limit } = {}) => {
    const params = new URLSearchParams({ ...(page && { page }), ...(limit && { limit }) }).toString();
    return apiFetch(`/wallet/admin/cash-funding-history${params ? `?${params}` : ""}`);
  },
};
