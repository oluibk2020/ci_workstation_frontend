import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../utils/roleRouting";

/**
 * Route-level guard. This is a UX convenience only — per docs Section 17,
 * "Never trust the frontend for authorization." The backend must
 * independently verify role and permissions on every request.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={dashboardPathForRole(role)} replace />;
  }

  return <Outlet />;
}
