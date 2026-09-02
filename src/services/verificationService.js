import { apiFetch } from "./api";

/**
 * Confirmed endpoints — but note: routes/verificationRoute.js,
 * controllers/verificationController.js, and
 * services/verificationService.js on the backend were NEW this session
 * (see docs/PATCH_NOTES.md) — no identity verification feature existed
 * anywhere before. Built directly against the existing schema
 * (IdentityVerification, IDDocument) with no schema changes.
 *
 * FILE STORAGE: documentUrl is a plain string on their schema, and no
 * file-upload library or cloud storage credentials exist in the backend
 * project. Rather than block on that, this sends a base64 data URI
 * directly as documentUrl — a pragmatic stand-in, not a production
 * design. Swap for a real upload-then-URL flow (S3/Cloudinary) once that
 * exists; nothing else about this service needs to change when it does.
 */
export const verificationService = {
  submit: (documents) =>
    apiFetch("/verification", { method: "POST", body: { documents } }),
  listPending: ({ page, limit } = {}) => {
    // BUG FIX: was missing the "?" before the query string — with any
    // param actually passed, this produced a malformed URL like
    // "/verification/pendinglimit=1" instead of
    // "/verification/pending?limit=1", which 404'd. Calling with no
    // arguments at all (as VerificationQueuePage does) masked this,
    // since an empty query string just appended nothing.
    const params = new URLSearchParams({
      ...(page && { page }),
      ...(limit && { limit }),
    }).toString();
    return apiFetch(`/verification/pending${params ? `?${params}` : ""}`);
  },
  review: (verificationId, approve, rejectionReason) =>
    apiFetch(`/verification/${verificationId}/review`, {
      method: "PATCH",
      body: { approve, ...(rejectionReason && { rejectionReason }) },
    }),
};

// Reads a File as a base64 data URI — see the storage note above for why.
export function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
