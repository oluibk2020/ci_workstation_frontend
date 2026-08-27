import { apiFetch } from "./api";

// Not yet called by CatalogContext (which is mocked). Wire these up once
// the real backend's Branch endpoints exist (see backend spec §7, §16 —
// service is named BranchService there). Branch creation/editing must
// remain Super Admin-only, enforced server-side.
export const branchService = {
  list: () => apiFetch("/branches"),
  get: (id) => apiFetch(`/branches/${id}`),
  create: (payload) => apiFetch("/branches", { method: "POST", body: payload }),
  update: (id, payload) => apiFetch(`/branches/${id}`, { method: "PATCH", body: payload }),
  remove: (id) => apiFetch(`/branches/${id}`, { method: "DELETE" }),
};
