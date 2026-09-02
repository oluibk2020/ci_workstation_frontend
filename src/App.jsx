import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "./components/layout/PublicLayout";
import AuthLayout from "./components/layout/AuthLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import ComingSoon from "./components/common/ComingSoon";

import LandingPage from "./pages/public/LandingPage";
import AboutPage from "./pages/public/AboutPage";
import WorkstationsPage from "./pages/public/WorkstationsPage";
import BranchesPage from "./pages/public/BranchesPage";
import PricingPage from "./pages/public/PricingPage";
import HowItWorksPage from "./pages/public/HowItWorksPage";
import ContactPage from "./pages/public/ContactPage";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import ClientDashboardPage from "./pages/client/ClientDashboardPage";
import VerificationPage from "./pages/client/VerificationPage";
import MySessionsPage from "./pages/client/MySessionsPage";
import ProfilePage from "./pages/client/ProfilePage";
import NotificationsPage from "./pages/client/NotificationsPage";
import PaymentHistoryPage from "./pages/client/PaymentHistoryPage";
import WalletPage from "./pages/client/WalletPage";
import QRPage from "./pages/client/QRPage";
import QRResolvePage from "./pages/scan/QRResolvePage";
import BookWorkstationPage from "./pages/client/BookWorkstationPage";
import MyBookingsPage from "./pages/client/MyBookingsPage";
import StaffDashboardPage from "./pages/staff/StaffDashboardPage";
import StaffScanPage from "./pages/staff/StaffScanPage";
import VerificationQueuePage from "./pages/staff/VerificationQueuePage";
import TodaysBookingsPage from "./pages/staff/TodaysBookingsPage";
import ReassignmentHistoryPage from "./pages/admin/ReassignmentHistoryPage";
import PaymentsWalletCreditsPage from "./pages/admin/PaymentsWalletCreditsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import StaffSeatsPage from "./pages/staff/StaffSeatsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminClientsPage from "./pages/admin/AdminClientsPage";
import AdminBranchesPage from "./pages/admin/AdminBranchesPage";
import AdminWorkstationsPage from "./pages/admin/AdminWorkstationsPage";
import AdminSeatsPage from "./pages/admin/AdminSeatsPage";

import { ROLES } from "./utils/constants";

export default function App() {
  return (
    <Routes>
      {/* ---------- Public site (docs Section 5) ---------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/workstations" element={<WorkstationsPage />} />
        <Route path="/branches" element={<BranchesPage />} />
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

      {/* ---------- Client (backend role: USER) — docs Section 7 ---------- */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.CLIENT]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/client/dashboard" element={<ClientDashboardPage />} />
          <Route path="/client/wallet" element={<WalletPage />} />
          <Route path="/client/qr" element={<QRPage />} />
          <Route path="/client/book" element={<BookWorkstationPage />} />
          <Route path="/client/bookings" element={<MyBookingsPage />} />
          <Route path="/client/gift-a-seat" element={<BookWorkstationPage />} />
          <Route path="/client/sessions" element={<MySessionsPage />} />
          <Route path="/client/transactions" element={<PaymentHistoryPage />} />
          <Route path="/client/notifications" element={<NotificationsPage />} />
          <Route path="/client/profile" element={<ProfilePage />} />
          <Route path="/client/verification" element={<VerificationPage />} />
        </Route>
      </Route>

      {/* ---------- Staff (backend role: STAFF, was "Manager") — docs Section 11 ---------- */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
          <Route path="/staff/scan" element={<StaffScanPage />} />
          <Route
            path="/staff/verifications"
            element={<VerificationQueuePage />}
          />
          <Route path="/staff/bookings" element={<TodaysBookingsPage />} />
          <Route
            path="/staff/reassignments"
            element={<ReassignmentHistoryPage />}
          />
          <Route path="/staff/seats" element={<StaffSeatsPage />} />
        </Route>
      </Route>

      {/* ---------- Admin (backend role: SUPER_ADMIN) — docs Section 14 ---------- */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/clients" element={<AdminClientsPage />} />
          <Route
            path="/admin/verifications"
            element={<VerificationQueuePage />}
          />
          <Route path="/admin/branches" element={<AdminBranchesPage />} />
          <Route
            path="/admin/workstations"
            element={<AdminWorkstationsPage />}
          />
          <Route path="/admin/seats" element={<AdminSeatsPage />} />
          <Route path="/admin/bookings" element={<TodaysBookingsPage />} />
          <Route
            path="/admin/reassignments"
            element={<ReassignmentHistoryPage />}
          />
          <Route
            path="/admin/payments"
            element={<PaymentsWalletCreditsPage />}
          />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route
            path="/admin/staff"
            element={<ComingSoon title="Staff" phase="Phase 1 — Foundation" />}
          />
          <Route
            path="/admin/settings"
            element={
              <ComingSoon title="Settings" phase="Phase 1 — Foundation" />
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ComingSoon title="Audit logs" phase="Phase 7 — Analytics" />
            }
          />
        </Route>
      </Route>

      {/* ---------- QR scan result (standalone — this is the literal URL
           encoded in the QR image, no layout chrome needed) ---------- */}
      <Route path="/u/:token" element={<QRResolvePage />} />

      {/* ---------- Fallback ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
