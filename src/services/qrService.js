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
  // BUG FIX: the backend wraps both of these under a `qrCode` key
  // (`{ data: { qrCode: {...} } }`), matching its own convention
  // elsewhere. Neither was unwrapped here, so QRPage.jsx's
  // `result.qrUrl` was always undefined — the rendered QR code encoded
  // nothing usable at all. Worse for getCurrent(): `{ qrCode: null }` is
  // still a truthy object, so QRPage.jsx's `status ? ... : ...` check
  // always thought an active QR existed, even for a brand-new user who
  // had never generated one.
  generate: () =>
    apiFetch("/qr/generate", { method: "POST" }).then((r) => r.qrCode),
  getCurrent: () => apiFetch("/qr/me").then((r) => r.qrCode),
  revoke: () => apiFetch("/qr/revoke", { method: "PATCH" }),
  // Public — no auth required, since staff scanning a client's QR aren't
  // authenticated as that client.
  resolve: (token) => apiFetch(`/qr/public/${token}`),
};
