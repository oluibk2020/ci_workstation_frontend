import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "./components/layout/PublicLayout";
import AuthLayout from "./components/layout/AuthLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import ComingSoon from "./components/common/ComingSoon";

import LandingPage from "./pages/public/LandingPage";
import AboutPage from "./pages/public/AboutPage";
import WorkstationsPage from "./pages/public/WorkstationsPage";
import LocationsPage from "./pages/public/LocationsPage";
import PricingPage from "./pages/public/PricingPage";
import HowItWorksPage from "./pages/public/HowItWorksPage";
import ContactPage from "./pages/public/ContactPage";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import ClientDashboardPage from "./pages/client/ClientDashboardPage";
import ManagerDashboardPage from "./pages/manager/ManagerDashboardPage";
import ManagerWorkstationsPage from "./pages/manager/ManagerWorkstationsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminLocationsPage from "./pages/admin/AdminLocationsPage";
import AdminWorkstationsPage from "./pages/admin/AdminWorkstationsPage";

import { ROLES } from "./utils/constants";

export default function App() {
  return (
    <Routes>
      {/* ---------- Public site (docs Section 5) ---------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/workstations" element={<WorkstationsPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* ---------- Authentication (docs Section 6) ---------- */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* ---------- Client area (docs Section 7) ---------- */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.CLIENT]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/client/dashboard" element={<ClientDashboardPage />} />
          <Route path="/client/book" element={<ComingSoon title="Book a workstation" phase="Phase 3 — Booking" />} />
          <Route path="/client/bookings" element={<ComingSoon title="My bookings" phase="Phase 3 — Booking" />} />
          <Route path="/client/gift-a-seat" element={<ComingSoon title="Gift a seat" phase="Phase 3 — Booking" />} />
          <Route path="/client/sessions" element={<ComingSoon title="My sessions" phase="Phase 6 — Sessions" />} />
          <Route path="/client/transactions" element={<ComingSoon title="Payment history" phase="Phase 4 — Payments" />} />
          <Route path="/client/notifications" element={<ComingSoon title="Notifications" phase="Phase 8 — Real-Time" />} />
          <Route path="/client/profile" element={<ComingSoon title="Profile" phase="Phase 1 — Foundation" />} />
        </Route>
      </Route>

      {/* ---------- Manager area (docs Section 11) ---------- */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
          <Route path="/manager/scan" element={<ComingSoon title="Scan client QR" phase="Phase 5 — QR" />} />
          <Route path="/manager/approvals" element={<ComingSoon title="Client approvals" phase="Phase 5 — QR" />} />
          <Route path="/manager/bookings" element={<ComingSoon title="Today's bookings" phase="Phase 3 — Booking" />} />
          <Route path="/manager/reschedules" element={<ComingSoon title="Reschedule requests" phase="Phase 3 — Booking" />} />
          <Route path="/manager/workstations" element={<ManagerWorkstationsPage />} />
        </Route>
      </Route>

      {/* ---------- Admin area (docs Section 14) ---------- */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/clients" element={<ComingSoon title="Clients" phase="Phase 1 — Foundation" />} />
          <Route path="/admin/approvals" element={<ComingSoon title="Client approvals" phase="Phase 5 — QR" />} />
          <Route path="/admin/workstations" element={<AdminWorkstationsPage />} />
          <Route path="/admin/locations" element={<AdminLocationsPage />} />
          <Route path="/admin/bookings" element={<ComingSoon title="Bookings" phase="Phase 3 — Booking" />} />
          <Route path="/admin/reschedules" element={<ComingSoon title="Reschedule requests" phase="Phase 3 — Booking" />} />
          <Route path="/admin/payments" element={<ComingSoon title="Payments" phase="Phase 4 — Payments" />} />
          <Route path="/admin/reports" element={<ComingSoon title="Reports" phase="Phase 7 — Analytics" />} />
          <Route path="/admin/managers" element={<ComingSoon title="Managers" phase="Phase 1 — Foundation" />} />
          <Route path="/admin/settings" element={<ComingSoon title="Settings" phase="Phase 1 — Foundation" />} />
          <Route path="/admin/audit-logs" element={<ComingSoon title="Audit logs" phase="Phase 7 — Analytics" />} />
        </Route>
      </Route>

      {/* ---------- Fallback ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
