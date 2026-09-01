import { apiFetch } from "./api";

// Confirmed real endpoints (routes/seatRoute.js, routes/adminSeatRoute.js).
export const seatService = {
  listByWorkstation: (workstationId) => apiFetch(`/seats/workstation/${workstationId}`),
  get: (seatId) => apiFetch(`/seats/${seatId}`),
  create: (workstationId, payload) =>
    apiFetch(`/admin/seats/workstation/${workstationId}`, { method: "POST", body: payload }),
  update: (seatId, payload) => apiFetch(`/admin/seats/${seatId}`, { method: "PATCH", body: payload }),
  updateStatus: (seatId, status) =>
    apiFetch(`/admin/seats/${seatId}/status`, { method: "PATCH", body: { status } }),
};
