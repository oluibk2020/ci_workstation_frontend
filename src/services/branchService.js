import { apiFetch } from "./api";

// Confirmed real endpoints (routes/branchRoute.js, routes/adminBranchRoute.js).
// NOTE: only GET (public) and POST (Super Admin create) exist — there is
// no update or delete route for a branch anywhere on the backend yet.
export const branchService = {
  list: () => apiFetch("/branches"),
  create: (payload) => apiFetch("/admin/branches", { method: "POST", body: payload }),
};
