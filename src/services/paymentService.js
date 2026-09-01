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
 * webhook route isn't mounted yet and has a crashing bug
 * (`walletService` used but never imported). Wallet funding cannot
 * complete end-to-end against their backend as it stands today, even once
 * this frontend calls it correctly.
 */
export const paymentService = {
  initialize: (amount) => apiFetch("/payments/initialize", { method: "POST", body: { amount } }),
  verify: (reference) => apiFetch(`/payments/verify/${reference}`),
};
