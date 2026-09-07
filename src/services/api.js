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
 * UPDATED (see docs/PATCH_NOTES.md — error-handling pass): their
 * middleware/errorMiddleware.js was rewritten. It used to flatten every
 * error to a fixed HTTP 500 with shape { error: "..." } regardless of
 * cause, discarding the real thrown message entirely. It now recognizes
 * known Prisma error types (mapping them to proper status codes) and
 * treats a plain thrown Error as this codebase's own convention for an
 * intentional, safe-to-show business-rule message — returned as
 * { success: false, message } with a 400, not hidden behind a generic
 * 500. `.message` is now always populated on every error response, so
 * `isGenericServerError` below should no longer trigger under normal
 * operation — kept as a defensive fallback rather than removed outright,
 * in case a future, still-uncaught error type reaches the client without
 * one.
 */

// Backend confirmed running on port 1524 locally (docs/PATCH_NOTES.md).
// It already versions its API under /api/v1 itself.
import { loadingManager } from "../utils/loadingManager";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:1524/api/v1";

function getToken() {
  try {
    // Must match AuthContext's STORAGE_KEY and storage type — it
    // deliberately uses sessionStorage (per-tab sessions), not
    // localStorage. Reading from the wrong one meant every authenticated
    // request went out with no Authorization header, so GET /auth/me
    // (called by ProtectedRoute right after login) always came back 401
    // and the app immediately logged the user back out.
    const stored = sessionStorage.getItem("workstation.auth");
    return stored ? JSON.parse(stored)?.token : null;
  } catch {
    return null;
  }
}

export async function apiFetch(
  path,
  { method = "GET", body, headers = {} } = {},
) {
  const token = getToken();
  loadingManager.start();

  try {
    let response;
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkError) {
      const err = new Error(
        "Unable to reach the Workstation server. Check your connection or try again.",
      );
      err.cause = networkError;
      err.status = 0;
      throw err;
    }

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    let envelope = null;
    if (isJson) {
      try {
        envelope = await response.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }
    }

    if (!response.ok || envelope?.success === false) {
      const err = new Error(
        envelope?.message ||
          envelope?.error ||
          `Request failed with status ${response.status}`,
      );
      err.code = envelope?.code;
      err.status = response.status;
      err.isGenericServerError =
        response.status === 500 && !envelope?.code && !envelope?.message;
      throw err;
    }

    return envelope?.data ?? envelope;
  } finally {
    loadingManager.stop();
  }
}
