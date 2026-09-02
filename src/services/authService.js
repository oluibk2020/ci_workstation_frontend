import { apiFetch } from "./api";

/**
 * Confirmed live and working against the real backend (docs/PATCH_NOTES.md
 * — a real user was registered and logged in successfully on 2026-08-31).
 *
 * NOTE: forgotPassword/resetPassword below have no real route on the
 * backend yet — services/forgetPasswordService.js and
 * services/resetPasswordService.js exist there, but nothing in
 * routes/ or app.js wires them up. Left in place for later; ForgotPasswordPage
 * and ResetPasswordPage stay on their existing mocked behavior until then.
 */
export const authService = {
  register: ({ name, email, password }) =>
    apiFetch("/auth/register", { method: "POST", body: { name, email, password } }),
  login: ({ email, password }) => apiFetch("/auth/login", { method: "POST", body: { email, password } }),
  me: () => apiFetch("/auth/me"),
  updateProfile: ({ name, profileImageUrl }) =>
    apiFetch("/auth/me", { method: "PATCH", body: { name, profileImageUrl } }),
  // Not yet reachable on the backend — see note above.
  forgotPassword: (email) => apiFetch("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token, password) =>
    apiFetch("/auth/reset-password", { method: "POST", body: { token, password } }),
};
