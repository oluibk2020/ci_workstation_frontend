import { apiFetch } from "./api";

// Not called anywhere yet — Phase 5 (QR & Verification) hasn't been built.
// Endpoint confirmed by the Testing/Deployment/Maintenance Guide §2
// (POST /api/v1/checkins). Staff explicitly trigger check-in after QR
// verification succeeds — it is never automatic from a scan alone.
export const checkinService = {
  checkIn: (bookingId) => apiFetch("/checkins", { method: "POST", body: { bookingId } }),
};
