import { apiFetch } from "./api";

/**
 * Not called anywhere yet — Phase 3 (Booking) hasn't been built. Endpoints
 * below are confirmed exactly as documented in the Testing/Deployment/
 * Maintenance Guide §2, so whoever builds the booking UI has the real
 * contract to build against instead of guessing.
 *
 * Reminders baked into the guide that the booking UI must respect:
 * - Availability returned here is NEVER final — the backend re-checks at
 *   booking time, so the UI must handle a booking attempt failing on an
 *   apparently-available seat (§6).
 * - Price is always backend-calculated; never send or trust a
 *   frontend-computed total (§10, §17).
 * - A single reassignment request can move multiple dates but only counts
 *   once against the 3-per-month limit (§5).
 */
export const bookingService = {
  getAvailability: (params) => apiFetch(`/availability?${new URLSearchParams(params)}`),
  create: (payload) => apiFetch("/bookings", { method: "POST", body: payload }),
  list: () => apiFetch("/bookings"),
  get: (id) => apiFetch(`/bookings/${id}`),
  cancel: (id, dates) => apiFetch(`/bookings/${id}/cancel`, { method: "POST", body: { dates } }),
  reassign: (id, changes) => apiFetch(`/bookings/${id}/reassign`, { method: "POST", body: { changes } }),
};
