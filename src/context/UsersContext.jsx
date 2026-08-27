import { createContext, useContext, useState, useCallback } from "react";
import { ROLES, VERIFICATION_STATUS } from "../utils/constants";

/**
 * UsersContext
 * ------------
 * The mock "account directory" — who exists, what role they hold, and
 * whether they're verified. This is deliberately separate from
 * AuthContext: AuthContext only tracks who is *currently logged in* on
 * this device; UsersContext is the (eventually server-side) source of
 * truth every login checks against.
 *
 * Deliberate design, per product decision: the public login/register flow
 * can only ever produce CLIENT accounts. There is no self-service way to
 * become Staff or Admin. The only way a Staff account comes to
 * exist is an Admin promoting an existing Client via setRole() (see
 * AdminClientsPage). One ADMIN account is seeded below to bootstrap the
 * system — this mirrors the fact that a real backend also needs a root
 * admin created out-of-band, not through public signup.
 *
 * IMPORTANT: this is entirely mocked and will be replaced once the
 * backend team confirms the real login/role system. Nothing here should
 * be treated as the final auth design — it exists so the frontend can be
 * built and demoed without blocking on that decision.
 */

const UsersContext = createContext(null);

let idCounter = 300;
function nextId() {
  idCounter += 1;
  return `user-${idCounter}`;
}

const SEED_USERS = [
  { id: "user-1", name: "John Doe", email: "john@demo.com", role: ROLES.CLIENT, verificationStatus: VERIFICATION_STATUS.VERIFIED },
  { id: "user-2", name: "Ada Obi", email: "ada@demo.com", role: ROLES.CLIENT, verificationStatus: VERIFICATION_STATUS.UNVERIFIED },
  { id: "user-3", name: "Peter James", email: "peter@demo.com", role: ROLES.CLIENT, verificationStatus: VERIFICATION_STATUS.UNVERIFIED },
  // Seeded bootstrap admin — not surfaced anywhere in the UI. Needed to
  // demo the admin dashboard until the backend team defines real admin
  // provisioning. Not a pattern ("admin@...") — a specific fixed account.
  { id: "user-admin", name: "Charis Admin", email: "admin@charis.dev", role: ROLES.ADMIN, verificationStatus: VERIFICATION_STATUS.VERIFIED },
];

export function UsersProvider({ children }) {
  const [users, setUsers] = useState(SEED_USERS);

  const findByEmail = useCallback(
    (email) => users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
    [users]
  );

  // The only way a new account is created through the public flow —
  // always CLIENT, always UNVERIFIED.
  const registerClient = useCallback(({ name, email }) => {
    const record = {
      id: nextId(),
      name,
      email,
      role: ROLES.CLIENT,
      verificationStatus: VERIFICATION_STATUS.UNVERIFIED,
    };
    setUsers((prev) => [...prev, record]);
    return record;
  }, []);

  // Admin-only action: promote a Client to Staff, or revert a Staff account
  // back to Client. Never exposed to the person it's being done to.
  const setRole = useCallback((userId, role) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  }, []);

  const setVerificationStatus = useCallback((userId, status) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, verificationStatus: status } : u)));
  }, []);

  const value = { users, findByEmail, registerClient, setRole, setVerificationStatus };

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within a UsersProvider");
  return ctx;
}
