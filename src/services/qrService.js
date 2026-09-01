import { apiFetch } from "./api";

/**
 * Not called anywhere yet — Phase 5 (QR & Verification) hasn't been built.
 * Endpoints confirmed directly from their routes/qrCodeRoute.js — this
 * replaces an earlier guess of a single "/qr/verify" endpoint, which
 * doesn't exist.
 *
 * QR is a persistent per-user credential (confirmed: QRCode model has no
 * bookingId, only userId — see docs/BACKEND_CODE_REVIEW.md §3). It's
 * generated once at registration and "regenerating" is just calling
 * generate() again — their service revokes any existing active QR first.
 * The QR itself encodes a URL (`${FRONTEND_URL}/u/:token`), which is what
 * `resolve` is for: staff scan it, hit the public resolve endpoint, and
 * get back the person's identity + today's booking at that branch (or
 * null if they have none today — that's a valid, non-error response).
 */
export const qrService = {
  generate: () => apiFetch("/qr/generate", { method: "POST" }),
  getCurrent: () => apiFetch("/qr/me"),
  revoke: () => apiFetch("/qr/revoke", { method: "PATCH" }),
  // Public — no auth required, since staff scanning a client's QR aren't
  // authenticated as that client.
  resolve: (token) => apiFetch(`/qr/public/${token}`),
};
