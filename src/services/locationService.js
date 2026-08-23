import { apiFetch } from "./api";

// Not yet called by CatalogContext (which is mocked). Wire these up once the
// Express/Prisma Location endpoints exist — see docs Section 18. Location
// creation/editing must remain Admin-only, enforced server-side.
export const locationService = {
  list: () => apiFetch("/locations"),
  get: (id) => apiFetch(`/locations/${id}`),
  create: (payload) => apiFetch("/locations", { method: "POST", body: payload }),
  update: (id, payload) => apiFetch(`/locations/${id}`, { method: "PATCH", body: payload }),
  remove: (id) => apiFetch(`/locations/${id}`, { method: "DELETE" }),
};
