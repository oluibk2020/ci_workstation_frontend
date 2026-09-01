import { apiFetch } from "./api";

/**
 * Not called anywhere yet — Phase 5 (QR & Verification) hasn't been built.
 * Endpoints and payload shape confirmed directly from
 * routes/checkinRoute.js and services/checkinService.js — corrects two
 * earlier guesses: the path is singular "/checkin" (not "/checkins"), and
 * check-in is keyed by `bookingDateId` (the specific day), not a whole
 * `bookingId`.
 *
 * `targetUserId` is optional — omit it to self-check-in (their backend
 * allows any authenticated USER to check themselves in, not just staff).
 * Pass it when Staff/Super Admin are checking someone else in.
 *
 * NOTE (see docs/BACKEND_CODE_REVIEW.md §2): their current implementation
 * does not check verificationStatus before allowing check-in, despite
 * their own spec requiring it for first-time access. Don't assume the
 * backend enforces this yet.
 */
export const checkinService = {
  checkIn: (bookingDateId, targetUserId) =>
    apiFetch("/checkin", { method: "POST", body: { bookingDateId, ...(targetUserId && { targetUserId }) } }),
  checkOut: (checkInId) => apiFetch(`/checkin/${checkInId}/checkout`, { method: "PATCH" }),
};
