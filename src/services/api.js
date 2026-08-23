/**
 * Base API client.
 *
 * All service files (authService, bookingService, locationService, ...)
 * should call `apiFetch` rather than using `fetch` directly, so auth
 * headers, error handling, and the base URL live in exactly one place.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

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
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}
