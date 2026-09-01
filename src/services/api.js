/**
 * Base API client.
 *
 * All service files (authService, bookingService, branchService, ...)
 * should call `apiFetch` rather than using `fetch` directly, so auth
 * headers, error handling, and the base URL live in exactly one place.
 *
 * Documented response envelope (Testing/Deployment/Maintenance Guide
 * §13/§23): { success, message, data } / { success, message, code }.
 *
 * REALITY CHECK (see docs/BACKEND_CODE_REVIEW.md §6): their actual
 * middleware/errorMiddleware.js is currently a stub. Every thrown error,
 * regardless of cause, becomes a flat HTTP 500 with shape
 * { error: "Internal Server Error..." } — a different key (`error`, not
 * `message`), no `code` ever, and the real thrown message (e.g. "Invalid
 * email or password.") is discarded. Only authMiddleware/roleMiddleware's
 * own 401/403 responses use the documented { success, message } shape.
 * apiFetch below handles both realities: it reads `.message` if present,
 * falls back to `.error` (their stub's actual key), and always attaches
 * the HTTP status so callers can tell "a real 401/403" apart from "their
 * error handling isn't finished yet and this 500 could mean anything."
 */

// Backend confirmed running on port 1524 locally (docs/PATCH_NOTES.md).
// It already versions its API under /api/v1 itself.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:1524/api/v1";

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
    const err = new Error(
      envelope?.message || envelope?.error || `Request failed with status ${response.status}`
    );
    err.code = envelope?.code; // documented codes — INSUFFICIENT_BALANCE, SEAT_UNAVAILABLE, etc.
    err.status = response.status;
    // True whenever this was their generic error-middleware stub (no
    // code, no proper `.message` — only the `.error` fallback text) hit
    // rather than a real, documented business-rule error.
    err.isGenericServerError = response.status === 500 && !envelope?.code && !envelope?.message;
    throw err;
  }

  // Unwrap the envelope so callers work with the payload directly.
  return envelope?.data ?? envelope;
}
