import { apiFetch } from "./api";

/**
 * Not yet called anywhere — Phase 4 payment integration hasn't been
 * wired up (WalletContext's `deposit` is still mocked). This is the real
 * flow, confirmed directly from their controllers/services:
 *
 *   1. initialize(amount) → returns a Paystack authorization_url; redirect
 *      the browser there (or open Paystack's inline popup with the
 *      accessCode).
 *   2. Person completes payment on Paystack.
 *   3. Paystack redirects back to `${FRONTEND_URL}/payment/callback` — a
 *      route this frontend doesn't have yet and will need to add. That
 *      page should call verify(reference) to check the outcome.
 *
 * IMPORTANT (see docs/BACKEND_CODE_REVIEW.md §1): as currently written on
 * their end, verify() only checks Paystack's own status — it does NOT
 * credit the wallet itself. Their webhook handler does that, but the
 * webhook route was unmounted and had a crashing bug (`walletService`
 * used but never imported) — both fixed in docs/PATCH_NOTES.md.
 *
 * `list` IS wired — see PaymentHistoryPage.jsx. Distinct from wallet
 * transactions (WalletContext): this is Paystack payment *attempts*
 * (INITIATED/PENDING/SUCCESS/FAILED/CANCELLED), including ones that never
 * successfully credited the wallet — closer to a receipt/attempt history
 * than a ledger of money that actually moved.
 */
export const paymentService = {
  initialize: (amount) => apiFetch("/payments/initialize", { method: "POST", body: { amount } }),
  verify: (reference) => apiFetch(`/payments/verify/${reference}`),
  list: ({ page, limit } = {}) => {
    // BUG FIX: same missing-"?" pattern as bookingService.list and
    // verificationService.listPending — currently masked because
    // PaymentHistoryPage calls this with no arguments, but would 404 the
    // moment pagination is actually used.
    const params = new URLSearchParams({ ...(page && { page }), ...(limit && { limit }) }).toString();
    return apiFetch(`/payments${params ? `?${params}` : ""}`);
  },
  // Super Admin only — cross-user view for the "Payments & Wallet
  // Credits" admin page.
  listAll: ({ page, limit } = {}) => {
    const params = new URLSearchParams({ ...(page && { page }), ...(limit && { limit }) }).toString();
    return apiFetch(`/payments/admin/all${params ? `?${params}` : ""}`);
  },
};
