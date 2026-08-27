import { apiFetch } from "./api";

// Not yet called by CatalogContext (which is mocked). Wire these up once
// the real backend's Workstation endpoints exist (see backend spec §7,
// §16). A Workstation is a type/category with a daily price — it does not
// carry status; that lives on Seat (see seatService.js).
export const workstationService = {
  list: (params) => apiFetch(`/workstations${params ? `?${new URLSearchParams(params)}` : ""}`),
  get: (id) => apiFetch(`/workstations/${id}`),
  create: (payload) => apiFetch("/workstations", { method: "POST", body: payload }),
  update: (id, payload) => apiFetch(`/workstations/${id}`, { method: "PATCH", body: payload }),
  remove: (id) => apiFetch(`/workstations/${id}`, { method: "DELETE" }),
};
