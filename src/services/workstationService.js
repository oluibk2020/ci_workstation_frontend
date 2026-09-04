import { apiFetch } from "./api";

// Confirmed real endpoints (routes/workstationRoute.js, routes/adminWorkstationRoute.js).
export const workstationService = {
  listByBranch: (branchId) => apiFetch(`/workstations/branch/${branchId}`),
  get: (workstationId) => apiFetch(`/workstations/${workstationId}`),
  // NEW — BUG FIX. Returns ALL statuses (ACTIVE + INACTIVE), unlike
  // listByBranch above which only ever returns ACTIVE ones. Without this,
  // a workstation set to INACTIVE became permanently unreachable through
  // the only endpoint that could return it — visible nowhere, not even to
  // the Super Admin who needed to reactivate it. Super Admin only.
  listAllByBranchAdmin: (branchId) => apiFetch(`/admin/workstations/branch/${branchId}`),
  create: (branchId, payload) =>
    apiFetch(`/admin/workstations/branch/${branchId}`, { method: "POST", body: payload }),
  update: (workstationId, payload) =>
    apiFetch(`/admin/workstations/${workstationId}`, { method: "PATCH", body: payload }),
  updateStatus: (workstationId, status) =>
    apiFetch(`/admin/workstations/${workstationId}/status`, { method: "PATCH", body: { status } }),
};
