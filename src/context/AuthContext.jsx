import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUsers } from "./UsersContext";

/**
 * AuthContext
 * -----------
 * Holds the current user, their role (CLIENT / MANAGER / ADMIN), and their
 * verification status (UNVERIFIED / VERIFIED — see docs Section 6 & 10).
 *
 * For now this is mocked against localStorage + UsersContext so the
 * frontend can be built and demoed before the Express/Prisma backend is
 * wired up. Swap the `login`, `register`, and `logout` bodies for real
 * calls to services/authService.js once the API is ready — the shape
 * returned (user, token) should stay the same so nothing else needs to
 * change.
 *
 * Role is never chosen at login. It comes from whatever UsersContext has
 * on file for that email — the public login/register flow can only ever
 * produce or return a CLIENT, unless an Admin has separately promoted that
 * account to Staff. This mirrors how the real backend will work once the
 * backend team confirms the login/role design — nothing here is final.
 */

const AuthContext = createContext(null);

const STORAGE_KEY = "workstation.auth";

export function AuthProvider({ children }) {
  const { findByEmail, registerClient } = useUsers();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async ({ email }) => {
      // TODO: replace with authService.login(email, password). The backend
      // is what decides the role — this lookup against UsersContext is
      // purely a stand-in until the backend team confirms that design.
      const record = findByEmail(email);
      if (!record) {
        const err = new Error("No account found with that email. Try registering instead.");
        err.code = "NO_ACCOUNT";
        throw err;
      }
      const mockUser = {
        id: record.id,
        name: record.name,
        email: record.email,
        role: record.role,
        verificationStatus: record.verificationStatus,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    },
    [findByEmail]
  );

  const register = useCallback(
    async ({ name, email }) => {
      // TODO: replace with authService.register(...). Always creates a
      // CLIENT — there is no public path to a Staff or Admin account.
      const record = registerClient({ name, email });
      const mockUser = { ...record };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    },
    [registerClient]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = {
    user,
    role: user?.role ?? null,
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
