import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../utils/roleRouting";

/**
 * Route-level guard. This is a UX convenience only — per docs Section 17,
 * "Never trust the frontend for authorization." The backend must
 * independently verify role and permissions on every request.
 *
 * BUG FIX: previously trusted whatever role was cached from the last
 * login/page-load, which could go stale if an Admin changed someone's
 * role or banned them while that person already had the app open (see
 * AuthContext.refreshUser's header for full context). Now re-validates
 * against the server on every entry to a role-gated route, so the UI
 * itself never lags behind reality for more than one navigation.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, isLoading, refreshUser } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(!!allowedRoles);

  useEffect(() => {
    if (!allowedRoles || !isAuthenticated) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    refreshUser().finally(() => {
      if (!cancelled) setChecking(false);
    });
    return () => {
      cancelled = true;
    };
    // Re-check every time the route itself changes, not just on mount —
    // navigating between two differently-gated routes should each get a
    // fresh check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (isLoading || checking) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={dashboardPathForRole(role)} replace />;
  }

  return <Outlet />;
}
