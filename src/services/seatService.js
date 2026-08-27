import { apiFetch } from "./api";

// Not yet called by CatalogContext (which is mocked). Wire these up once
// the real backend's Seat endpoints exist (see backend spec §7, §16). A
// Seat is the actual bookable unit — it carries status and physical specs;
// price lives on its parent Workstation, not here.
export const seatService = {
  list: (params) => apiFetch(`/seats${params ? `?${new URLSearchParams(params)}` : ""}`),
  get: (id) => apiFetch(`/seats/${id}`),
  create: (payload) => apiFetch("/seats", { method: "POST", body: payload }),
  update: (id, payload) => apiFetch(`/seats/${id}`, { method: "PATCH", body: payload }),
  updateStatus: (id, status) => apiFetch(`/seats/${id}/status`, { method: "PATCH", body: { status } }),
  remove: (id) => apiFetch(`/seats/${id}`, { method: "DELETE" }),
};
