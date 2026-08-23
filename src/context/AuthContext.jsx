import { createContext, useContext, useState, useEffect, useCallback } from "react";

/**
 * AuthContext
 * -----------
 * Holds the current user, their role (CLIENT / MANAGER / ADMIN), and their
 * verification status (UNVERIFIED / VERIFIED — see docs Section 6 & 10).
 *
 * For now this is mocked against localStorage so the frontend can be built
 * and demoed before the Express/Prisma backend is wired up. Swap the
 * `login`, `register`, and `logout` bodies for real calls to
 * services/authService.js once the API is ready — the shape returned
 * (user, token) should stay the same so nothing else needs to change.
 */

const AuthContext = createContext(null);

const STORAGE_KEY = "workstation.auth";

export function AuthProvider({ children }) {
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

  const login = useCallback(async ({ email }) => {
    // TODO: replace with authService.login(email, password)
    // Demo-only convention so the three dashboards can be previewed before
    // the real backend/role assignment exists.
    let role = "CLIENT";
    if (email.toLowerCase().startsWith("manager@")) role = "MANAGER";
    if (email.toLowerCase().startsWith("admin@")) role = "ADMIN";

    const mockUser = {
      id: "mock-user-1",
      name: email.split("@")[0] || "Client",
      email,
      role, // CLIENT | MANAGER | ADMIN
      verificationStatus: role === "CLIENT" ? "UNVERIFIED" : "VERIFIED",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  }, []);

  const register = useCallback(async ({ name, email }) => {
    // TODO: replace with authService.register(...)
    const mockUser = {
      id: "mock-user-new",
      name,
      email,
      role: "CLIENT",
      verificationStatus: "UNVERIFIED",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  }, []);

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
