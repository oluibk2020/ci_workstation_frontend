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
  getAvailability: ({ branchId, workstationId, startDate, endDate }) =>
    apiFetch(`/availability?${new URLSearchParams({ branchId, workstationId, startDate, endDate })}`),

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

  list: ({ status, page, limit } = {}) =>
    apiFetch(`/bookings${new URLSearchParams({ ...(status && { status }), ...(page && { page }), ...(limit && { limit }) })}`),

  get: (bookingId) => apiFetch(`/bookings/${bookingId}`),

  // dates: array of "YYYY-MM-DD" strings to cancel from this booking.
  cancel: (bookingId, dates) => apiFetch(`/bookings/${bookingId}/cancel`, { method: "POST", body: { dates } }),

  // changes: array of { fromDate, toDate, toBranchId?, toWorkstationId?, toSeatId? }.
  // Destination fields are optional per change — omit to keep the same
  // branch/workstation/seat and just move the date.
  reassign: (bookingId, changes) => apiFetch(`/bookings/${bookingId}/reassign`, { method: "POST", body: { changes } }),
};
