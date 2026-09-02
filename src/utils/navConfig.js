import {
  LayoutDashboard,
  CalendarPlus,
  ListChecks,
  Gift,
  Clock,
  Receipt,
  Bell,
  User,
  Wallet,
  QrCode,
  UserCheck,
  ClipboardList,
  RefreshCcw,
  MonitorSmartphone,
  Armchair,
  Users,
  MapPin,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Settings,
  FileClock,
  UserCog,
} from "lucide-react";
import { ROLES } from "./constants";

export const NAV_CONFIG = {
  [ROLES.CLIENT]: [
    { to: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/client/wallet", label: "My Wallet", icon: Wallet },
    { to: "/client/qr", label: "My QR Pass", icon: QrCode },
    { to: "/client/verification", label: "Verification", icon: UserCheck },
    { to: "/client/book", label: "Book Workstation", icon: CalendarPlus },
    { to: "/client/bookings", label: "My Bookings", icon: ListChecks },
    { to: "/client/gift-a-seat", label: "Gift a Seat", icon: Gift },
    { to: "/client/sessions", label: "My Sessions", icon: Clock },
    { to: "/client/transactions", label: "Payment History", icon: Receipt },
    { to: "/client/notifications", label: "Notifications", icon: Bell },
    { to: "/client/profile", label: "Profile", icon: User },
  ],
  [ROLES.MANAGER]: [
    { to: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/staff/scan", label: "Scan QR", icon: QrCode },
    {
      to: "/staff/verifications",
      label: "Verification Requests",
      icon: UserCheck,
    },
    { to: "/staff/bookings", label: "Today's Bookings", icon: ClipboardList },
    {
      to: "/staff/reassignments",
      label: "Reassignment History",
      icon: RefreshCcw,
    },
    { to: "/staff/seats", label: "Seats", icon: Armchair },
  ],
  [ROLES.ADMIN]: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/clients", label: "Clients", icon: Users },
    {
      to: "/admin/verifications",
      label: "Verification Requests",
      icon: UserCheck,
    },
    { to: "/admin/branches", label: "Branches", icon: MapPin },
    {
      to: "/admin/workstations",
      label: "Workstation Types",
      icon: MonitorSmartphone,
    },
    { to: "/admin/seats", label: "Seats", icon: Armchair },
    { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
    {
      to: "/admin/reassignments",
      label: "Reassignment History",
      icon: RefreshCcw,
    },
    {
      to: "/admin/payments",
      label: "Payments & Wallet Credits",
      icon: CreditCard,
    },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/admin/staff", label: "Staff", icon: UserCog },
    { to: "/admin/settings", label: "Settings", icon: Settings },
    { to: "/admin/audit-logs", label: "Audit Logs", icon: FileClock },
  ],
};

export const ROLE_LABEL = {
  [ROLES.CLIENT]: "Client",
  [ROLES.MANAGER]: "Staff",
  [ROLES.ADMIN]: "Admin",
};

export const ROLE_ICON = {
  [ROLES.CLIENT]: User,
  [ROLES.MANAGER]: ShieldCheck,
  [ROLES.ADMIN]: ShieldCheck,
};
