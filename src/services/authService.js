import { apiFetch } from "./api";

/**
 * Confirmed live and working against the real backend (docs/PATCH_NOTES.md
 * — a real user was registered and logged in successfully on 2026-08-31).
 *
 * NOTE: forgotPassword/resetPassword below have no real route on the
 * backend yet — services/forgetPasswordService.js and
 * services/resetPasswordService.js exist there, but nothing in
 * routes/ or app.js wires them up. Left in place for later; ForgotPasswordPage
 */
export const authService = {
  register: ({ name, email, password, termsAccepted }) =>
    apiFetch("/auth/register", { method: "POST", body: { name, email, password, termsAccepted } }),
  login: ({ email, password }) => apiFetch("/auth/login", { method: "POST", body: { email, password } }),
  // Confirmed real endpoint — POST /auth/google, body { idToken }. Backend
  // verifies the token server-side against GOOGLE_CLIENT_ID and either
  // logs in an existing account or silently registers a new one (with a
  // wallet + QR pass created the same as normal registration). Response
  // shape is flat { user, token }, same as login — no extra nesting.
  googleLogin: (idToken, termsAccepted = false) => apiFetch("/auth/google", { method: "POST", body: { idToken, termsAccepted } }),
  me: () => apiFetch("/auth/me"),
  updateProfile: ({ name, profileImageUrl }) =>
    apiFetch("/auth/me", { method: "PATCH", body: { name, profileImageUrl } }),
  forgotPassword: (email) => apiFetch("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token, password) =>
    apiFetch("/auth/reset-password", { method: "POST", body: { token, password } }),
};
