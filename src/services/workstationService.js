import { apiFetch } from "./api";

// Confirmed real endpoints (routes/workstationRoute.js, routes/adminWorkstationRoute.js).
export const workstationService = {
  listByBranch: (branchId) => apiFetch(`/workstations/branch/${branchId}`),
  get: (workstationId) => apiFetch(`/workstations/${workstationId}`),
  create: (branchId, payload) =>
    apiFetch(`/admin/workstations/branch/${branchId}`, { method: "POST", body: payload }),
  update: (workstationId, payload) =>
    apiFetch(`/admin/workstations/${workstationId}`, { method: "PATCH", body: payload }),
  updateStatus: (workstationId, status) =>
    apiFetch(`/admin/workstations/${workstationId}/status`, { method: "PATCH", body: { status } }),
};
