import { apiFetch } from "./api";

// Not yet called by CatalogContext (which is mocked). Wire these up once the
// Express/Prisma Workstation endpoints exist — see docs Section 8, 18.
export const workstationService = {
  list: (params) => apiFetch(`/workstations${params ? `?${new URLSearchParams(params)}` : ""}`),
  get: (id) => apiFetch(`/workstations/${id}`),
  create: (payload) => apiFetch("/workstations", { method: "POST", body: payload }),
  update: (id, payload) => apiFetch(`/workstations/${id}`, { method: "PATCH", body: payload }),
  updateStatus: (id, status) => apiFetch(`/workstations/${id}/status`, { method: "PATCH", body: { status } }),
  remove: (id) => apiFetch(`/workstations/${id}`, { method: "DELETE" }),
};
