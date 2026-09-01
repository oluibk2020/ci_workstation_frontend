import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";

/**
 * AuthContext
 * -----------
 * Wired to the real backend, confirmed running (docs/PATCH_NOTES.md).
 * Holds the current user, their role (USER/STAFF/SUPER_ADMIN — see
 * constants.js, values match the backend exactly), account status, and
 * verification status.
 *
 * KNOWN BACKEND QUIRK — worked around here, not fixed there:
 * their register controller has a variable-naming bug (see
 * docs/BACKEND_CODE_REVIEW.md §1) that wraps the whole
 * {user, token, qrCode} bundle one level deeper than login does. login's
 * response is { user, token } flat; register's is { user: { user, token,
 * qrCode } }. normalizeAuthResult() below handles both shapes so the rest
 * of the app never has to think about it.
 */

const AuthContext = createContext(null);

const STORAGE_KEY = "workstation.auth";

function normalizeAuthResult(result, { fromRegister = false } = {}) {
  const source = fromRegister ? result.user : result;
  return {
    user: source.user,
    token: source.token,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On load, trust a stored session optimistically, then quietly confirm
  // it against the backend (GET /auth/me) — clears it if the token is
  // invalid/expired rather than leaving a stale, wrong user in the UI.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }

    let cached;
    try {
      cached = JSON.parse(stored);
      setUser(cached);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setIsLoading(false);
      return;
    }

    authService
      .me()
      .then(({ user: freshUser }) => {
        const merged = { ...cached, ...freshUser };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        setUser(merged);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const result = await authService.login({ email, password });
    const { user: loggedInUser, token } = normalizeAuthResult(result);
    const stored = { ...loggedInUser, token };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setUser(stored);
    return stored;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const result = await authService.register({ name, email, password });
    const { user: newUser, token } = normalizeAuthResult(result, { fromRegister: true });
    const stored = { ...newUser, token };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setUser(stored);
    return stored;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = {
    user,
    role: user?.role ?? null,
    status: user?.status ?? null,
    verificationStatus: user?.verificationStatus ?? null,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
