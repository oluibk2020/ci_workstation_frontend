import { apiFetch } from "./api";

/**
 * Not called anywhere yet — Phase 5 (QR & Verification) hasn't been built.
 * `verify` is confirmed exactly as documented in the Testing/Deployment/
 * Maintenance Guide §2 (POST /api/v1/qr/verify).
 *
 * QR is a persistent per-user credential, not generated per booking — see
 * docs/BACKEND_ALIGNMENT.md §3. Regenerating it revokes the old one
 * (`QR_REVOKED`). Staff scan resolves the person; the backend then checks
 * that person's booking for today, rather than decoding a booking ID from
 * the QR itself. A `regenerate` endpoint will belong here once built.
 */
export const qrService = {
  verify: (qrToken) => apiFetch("/qr/verify", { method: "POST", body: { qrToken } }),
};
