import {
  LayoutDashboard, CalendarPlus, ListChecks, Gift, Clock, Receipt, Bell, User, Wallet,
  QrCode, UserCheck, ClipboardList, RefreshCcw, MonitorSmartphone,
  Users, MapPin, CreditCard, BarChart3, ShieldCheck, Settings, FileClock, UserCog,
} from "lucide-react";
import { ROLES } from "./constants";

export const NAV_CONFIG = {
  [ROLES.CLIENT]: [
    { to: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/client/wallet", label: "My Wallet", icon: Wallet },
    { to: "/client/book", label: "Book Workstation", icon: CalendarPlus },
    { to: "/client/bookings", label: "My Bookings", icon: ListChecks },
    { to: "/client/gift-a-seat", label: "Gift a Seat", icon: Gift },
    { to: "/client/sessions", label: "My Sessions", icon: Clock },
    { to: "/client/transactions", label: "Payment History", icon: Receipt },
    { to: "/client/notifications", label: "Notifications", icon: Bell },
    { to: "/client/profile", label: "Profile", icon: User },
  ],
  [ROLES.MANAGER]: [
    { to: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/manager/scan", label: "Scan QR", icon: QrCode },
    { to: "/manager/approvals", label: "Client Approvals", icon: UserCheck },
    { to: "/manager/bookings", label: "Today's Bookings", icon: ClipboardList },
    { to: "/manager/reschedules", label: "Reschedule Requests", icon: RefreshCcw },
    { to: "/manager/workstations", label: "Workstations", icon: MonitorSmartphone },
  ],
  [ROLES.ADMIN]: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/clients", label: "Clients", icon: Users },
    { to: "/admin/approvals", label: "Client Approvals", icon: UserCheck },
    { to: "/admin/workstations", label: "Workstations", icon: MonitorSmartphone },
    { to: "/admin/locations", label: "Locations", icon: MapPin },
    { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
    { to: "/admin/reschedules", label: "Reschedule Requests", icon: RefreshCcw },
    { to: "/admin/payments", label: "Payments", icon: CreditCard },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/admin/managers", label: "Managers", icon: UserCog },
    { to: "/admin/settings", label: "Settings", icon: Settings },
    { to: "/admin/audit-logs", label: "Audit Logs", icon: FileClock },
  ],
};

export const ROLE_LABEL = {
  [ROLES.CLIENT]: "Client",
  [ROLES.MANAGER]: "Manager",
  [ROLES.ADMIN]: "Administrator",
};

export const ROLE_ICON = {
  [ROLES.CLIENT]: User,
  [ROLES.MANAGER]: ShieldCheck,
  [ROLES.ADMIN]: ShieldCheck,
};
