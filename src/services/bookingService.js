import { apiFetch } from "./api";

/**
 * Endpoints and payload shape confirmed directly from their
 * routes/bookingRoute.js and services/bookingService.js.
 *
 * `cancel` and `reassign` were unimplemented on the backend as of the
 * last review (empty stub services, no routes) — that's now fixed (see
 * docs/PATCH_NOTES.md, 2026-08-31 backend patch: cancellationService.js
 * and reassignmentService.js were both newly implemented, and the two
 * routes below now exist and are wired). Still not called by any UI —
 * Phase 3 (Booking) itself hasn't been built yet — but the service layer
 * is ready for whenever it is.
 *
 * Reminders baked into their real implementation that the booking UI must
 * respect:
 * - Availability is never final at browse time — the backend re-checks
 *   inside a serializable transaction at booking time, and can reject an
 *   apparently-available seat.
 * - Price is always backend-calculated (workstation.pricePerDay × days);
 *   never send or trust a frontend-computed total.
 * - Two independent 30-day rules: a booking can't span more than 30
 *   *operating* days, and can't start more than 30 *calendar* days out.
 * - Gifting to someone not yet registered: first attempt without
 *   `createBeneficiaryAccount`; if it fails with "BENEFICIARY_NOT_REGISTERED",
 *   prompt to invite them, then resubmit with `createBeneficiaryAccount: true`
 *   and a `beneficiaryName`.
 * - Cancelling a date credits the BOOKER's wallet (not the beneficiary's) —
 *   never a cash refund. Reassigning is capped at 3 operations/month; one
 *   call with multiple `changes` still counts as a single operation.
 * - Only the person who made the booking (bookedByUserId) can cancel or
 *   reassign it — not the beneficiary, even if the beneficiary is the one
 *   physically using the seat.
 */
export const bookingService = {
  // BUG FIX: their controller nests the actual payload one level deeper
  // than most of their other endpoints — { data: { availability: {...} } }
  // instead of { data: {...} } directly (matches their own convention
  // elsewhere, e.g. { data: { user } }, { data: { wallet } }, just easy to
  // miss). Without unwrapping `.availability` here, callers received
  // { availability: {...} } and any code reading `.dates` off the result
  // directly (e.g. BookWorkstationPage's availableSeats calculation) got
  // undefined, then threw trying to call .filter() on it.
  getAvailability: async ({ branchId, workstationId, startDate, endDate }) => {
    const result = await apiFetch(
      `/availability?${new URLSearchParams({ branchId, workstationId, startDate, endDate })}`
    );
    return result.availability;
  },

  create: ({
    bookingFor, // "SELF" | "OTHER"
    beneficiaryEmail,
    beneficiaryName,
    createBeneficiaryAccount,
    branchId,
    workstationId,
    seatId,
    type, // "CONTINUOUS" | "FLEXIBLE"
    startDate, // for CONTINUOUS
    endDate, // for CONTINUOUS
    dates, // for FLEXIBLE — array of "YYYY-MM-DD"
  }) =>
    apiFetch("/bookings", {
      method: "POST",
      body: { bookingFor, beneficiaryEmail, beneficiaryName, createBeneficiaryAccount, branchId, workstationId, seatId, type, startDate, endDate, dates },
    }),

  list: ({ status, page, limit } = {}) => {
    // BUG FIX: was missing the "?" before the query string — calling
    // with any argument (e.g. { status: "ACTIVE" }, used by
    // ClientDashboardPage) produced a malformed URL like
    // "/bookingsstatus=ACTIVE" instead of "/bookings?status=ACTIVE",
    // which 404'd. Calling with no arguments (MyBookingsPage,
    // MySessionsPage) masked this, since an empty query string just
    // appended nothing.
    const params = new URLSearchParams({
      ...(status && { status }),
      ...(page && { page }),
      ...(limit && { limit }),
    }).toString();
    return apiFetch(`/bookings${params ? `?${params}` : ""}`);
  },

  get: (bookingId) => apiFetch(`/bookings/${bookingId}`),

  // Staff/Super Admin only — new backend endpoint, see docs/PATCH_NOTES.md.
  getTodaysBookings: (branchId) => apiFetch(`/bookings/today?${new URLSearchParams({ branchId })}`),

  // Super Admin only — history log, not a "requests" queue (reassignment
  // is self-service in this system, there's no approval step).
  getReassignmentHistory: ({ page, limit } = {}) => {
    const params = new URLSearchParams({ ...(page && { page }), ...(limit && { limit }) }).toString();
    return apiFetch(`/bookings/reassignments/history${params ? `?${params}` : ""}`);
  },

  // dates: array of "YYYY-MM-DD" strings to cancel from this booking.
  cancel: (bookingId, dates) => apiFetch(`/bookings/${bookingId}/cancel`, { method: "POST", body: { dates } }),

  // changes: array of { fromDate, toDate, toBranchId?, toWorkstationId?, toSeatId? }.
  // Destination fields are optional per change — omit to keep the same
  // branch/workstation/seat and just move the date.
  reassign: (bookingId, changes) => apiFetch(`/bookings/${bookingId}/reassign`, { method: "POST", body: { changes } }),
};
