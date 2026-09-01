import { apiFetch } from "./api";

/**
 * Confirmed endpoint — but note: routes/publicUserRoute.js,
 * controllers/publicUserController.js, and services/publicUserService.js
 * on the backend were RECONSTRUCTED by us (they were missing from the
 * repo entirely, excluded by a .gitignore bug — see
 * docs/BACKEND_CODE_REVIEW.md §1 and PATCH_NOTES.md). This is our own
 * best-effort guess at what the backend team intended, built to solve a
 * real problem: gifting a seat needs to know upfront whether the
 * recipient's email is already registered, since the server-side error
 * for "not registered" ("BENEFICIARY_NOT_REGISTERED") gets flattened into
 * their generic 500 stub and loses its specific meaning by the time it
 * reaches the frontend (see docs/BACKEND_CODE_REVIEW.md §6). Checking
 * first avoids ever hitting that ambiguous error in the first place.
 *
 * If the backend team's real implementation differs, this just needs its
 * endpoint path/response shape updated to match — nothing else in the
 * booking flow depends on more than { exists, name }.
 */
export const publicUserService = {
  checkEmail: (email) => apiFetch(`/public/users/check-email?${new URLSearchParams({ email })}`),
};
