import { apiFetch } from "./api";

// Super Admin only. New backend endpoint — see docs/PATCH_NOTES.md.
// These settings now genuinely affect enforcement (bookingService.js and
// reassignmentService.js were re-wired to read from here at call time,
// replacing what used to be hardcoded constants).
export const systemConfigService = {
  getAll: () => apiFetch("/admin/settings"),
  update: (key, value) =>
    apiFetch(`/admin/settings/${key}`, { method: "PATCH", body: { value } }),
};
