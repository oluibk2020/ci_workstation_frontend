/**
 * Base API client.
 *
 * All service files (authService, bookingService, branchService, ...)
 * should call `apiFetch` rather than using `fetch` directly, so auth
 * headers, error handling, and the base URL live in exactly one place.
 *
 * Response envelope matches the backend's documented API principles
 * (Testing/Deployment/Maintenance Guide §13/§23):
 *   Success: { success: true,  message: "...", data: {...} }
 *   Error:   { success: false, message: "...", code: "ERROR_CODE" }
 *
 * apiFetch unwraps `data.data` on success so callers get the clean payload
 * directly, and attaches `.code` to thrown errors so callers can branch on
 * the documented error codes (INSUFFICIENT_BALANCE, SEAT_UNAVAILABLE,
 * BOOKING_CONFLICT, REASSIGNMENT_LIMIT_REACHED, QR_REVOKED, etc.) instead
 * of matching on message text.
 */

// Backend versions its API under /api/v1 (Testing/Deployment/Maintenance
// Guide §13, "Version APIs under /api/v1").
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

function getToken() {
  try {
    const stored = localStorage.getItem("workstation.auth");
    return stored ? JSON.parse(stored)?.token : null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const envelope = isJson ? await response.json() : null;

  if (!response.ok || envelope?.success === false) {
    const err = new Error(envelope?.message || `Request failed with status ${response.status}`);
    err.code = envelope?.code; // e.g. INSUFFICIENT_BALANCE, SEAT_UNAVAILABLE, QR_REVOKED
    throw err;
  }

  // Unwrap the envelope so callers work with the payload directly.
  return envelope?.data ?? envelope;
}
