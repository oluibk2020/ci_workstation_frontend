import { apiFetch } from "./api";

/**
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
 * Verification and ban checks ARE enforced server-side (patched
 * 2026-08-31 — see docs/PATCH_NOTES.md): an UNVERIFIED or BANNED person
 * being checked in will get a real error back, not a silent success.
 */
export const checkinService = {
  checkIn: (bookingDateId, targetUserId) =>
    apiFetch("/checkin", { method: "POST", body: { bookingDateId, ...(targetUserId && { targetUserId }) } }),
  checkOut: (checkInId) => apiFetch(`/checkin/${checkInId}/checkout`, { method: "PATCH" }),
};
