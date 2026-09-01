import { apiFetch } from "./api";

/**
 * Confirmed real endpoints (routes/adminRoute.js, services/adminService.js).
 * Super Admin only — enforced server-side via requireRole("SUPER_ADMIN").
 *
 * Both updateStatus and updateRole reject changing your own account
 * (their adminService.js throws "You cannot change your own account
 * status/role.") — AdminClientsPage hides those actions on your own row
 * to match, but the backend is the real enforcement point.
 */
export const adminUserService = {
  list: ({ search, status, role, page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (role) params.set("role", role);
    params.set("page", page);
    params.set("limit", limit);
    return apiFetch(`/admin/users?${params}`);
  },
  updateStatus: (userId, status) =>
    apiFetch(`/admin/users/${userId}/status`, { method: "PATCH", body: { status } }),
  updateRole: (userId, role) =>
    apiFetch(`/admin/users/${userId}/role`, { method: "PATCH", body: { role } }),
};
