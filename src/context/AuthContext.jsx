import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services/authService";

/**
 * AuthContext
 * -----------
 * Wired to the real backend, confirmed running (docs/PATCH_NOTES.md).
 * Holds the current user, their role (USER/STAFF/SUPER_ADMIN — see
 * constants.js, values match the backend exactly), account status, and
 * verification status.
 *
 * DELIBERATE CHOICE — sessionStorage, not localStorage: requested
 * directly, to test multiple roles side by side (e.g. Admin in one tab,
 * Staff in another) without one login overwriting the other.
 * localStorage is shared across every tab of the same browser for the
 * same site — logging in as a second role in a new tab would silently
 * hijack the first tab's session too, since they're both reading/writing
 * the exact same stored value. sessionStorage is genuinely isolated per
 * tab (per browsing context, more precisely), so each tab now keeps its
 * own independent login.
 *
 * Real trade-off, not a free upgrade: a session no longer survives
 * closing the tab/browser — sessionStorage is cleared when its tab
 * closes, where localStorage persisted indefinitely ("stay logged in").
 * For heavy multi-role testing this is normally the more useful default;
 * reconsider before shipping to real end users if "stay logged in
 * between visits" matters for them.
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
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }

    let cached;
    try {
      cached = JSON.parse(stored);
      setUser(cached);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      setIsLoading(false);
      return;
    }

    authService
      .me()
      .then(({ user: freshUser }) => {
        const merged = { ...cached, ...freshUser };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        setUser(merged);
      })
      .catch(() => {
        sessionStorage.removeItem(STORAGE_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const result = await authService.login({ email, password });
    const { user: loggedInUser, token } = normalizeAuthResult(result);
    const stored = { ...loggedInUser, token };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setUser(stored);
    return stored;
  }, []);

  // Same shape as login's response (flat { user, token }) — no register-
  // style extra nesting to work around here. Handles both "log in with an
  // existing Google-linked account" and "silently register a brand new
  // one" — the backend decides which happened, the frontend doesn't need
  // to know or care.
  const loginWithGoogle = useCallback(async (idToken) => {
    const result = await authService.googleLogin(idToken);
    const { user: loggedInUser, token } = normalizeAuthResult(result);
    const stored = { ...loggedInUser, token };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setUser(stored);
    return stored;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const result = await authService.register({ name, email, password });
    const { user: newUser, token } = normalizeAuthResult(result, {
      fromRegister: true,
    });
    const stored = { ...newUser, token };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setUser(stored);
    return stored;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  // BUG FIX: role/status were only ever re-validated against the server
  // once, on initial page load. If an Admin changed someone's role or
  // banned them while that person already had the app open in a tab,
  // nothing re-checked it — ProtectedRoute kept trusting the stale
  // cached role indefinitely, until the next full page refresh. The
  // backend itself was already fixed to re-check on every API request
  // (see authMiddleware.js), so no real data/action was ever actually
  // exposed — but the frontend UI (sidebar, route access) could stay
  // wrong-looking for an open session. ProtectedRoute now calls this on
  // every protected-route entry to close that window.
  const refreshUser = useCallback(async () => {
    try {
      const { user: freshUser } = await authService.me();
      setUser((prev) => {
        if (!prev) return prev;
        const merged = { ...prev, ...freshUser };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      });
      return freshUser;
    } catch {
      // Token invalid/expired/account gone — same handling as the
      // initial-load check above.
      sessionStorage.removeItem(STORAGE_KEY);
      setUser(null);
      return null;
    }
  }, []);

  // Merges fresh fields (e.g. after PATCH /auth/me, or a re-fetch of
  // verificationStatus) into the stored session without a full re-login.
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...patch };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = {
    user,
    role: user?.role ?? null,
    status: user?.status ?? null,
    verificationStatus: user?.verificationStatus ?? null,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
