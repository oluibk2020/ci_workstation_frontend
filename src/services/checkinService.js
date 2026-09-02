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
 *
 * BUG FIX: their controller nests the actual CheckIn record one level
 * deeper — { data: { checkIn: {...} } } — matching their own convention
 * elsewhere (same class of issue just found and fixed in
 * bookingService.getAvailability). Without unwrapping `.checkIn` here,
 * QRResolvePage.jsx's checkout button was checking `actionResult?.id`
 * against a value that was always undefined (the real id lives at
 * `actionResult.checkIn.id`) — its guard clause returned immediately
 * every time, so Check Out silently did nothing, with no error shown at
 * all.
 */
export const checkinService = {
  checkIn: async (bookingDateId, targetUserId) => {
    const result = await apiFetch("/checkin", {
      method: "POST",
      body: { bookingDateId, ...(targetUserId && { targetUserId }) },
    });
    return result.checkIn;
  },
  checkOut: async (checkInId) => {
    const result = await apiFetch(`/checkin/${checkInId}/checkout`, { method: "PATCH" });
    return result.checkIn;
  },
};
