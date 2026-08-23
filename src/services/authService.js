import { apiFetch } from "./api";

// Not yet called by AuthContext (which is mocked). Wire these up once the
// Express/Prisma auth endpoints exist — see docs Section 6.
export const authService = {
  login: (email, password) => apiFetch("/auth/login", { method: "POST", body: { email, password } }),
  register: (payload) => apiFetch("/auth/register", { method: "POST", body: payload }),
  forgotPassword: (email) => apiFetch("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token, password) =>
    apiFetch("/auth/reset-password", { method: "POST", body: { token, password } }),
  me: () => apiFetch("/auth/me"),
};
