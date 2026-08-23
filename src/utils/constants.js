// Central place for the enums used throughout the docs so copy/labels stay
// consistent wherever a status badge is rendered.

export const ROLES = {
  CLIENT: "CLIENT",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
};

export const VERIFICATION_STATUS = {
  UNVERIFIED: "UNVERIFIED",
  VERIFIED: "VERIFIED",
};

export const WORKSTATION_STATUS = {
  AVAILABLE: "AVAILABLE",
  BOOKED: "BOOKED",
  OCCUPIED: "OCCUPIED",
  MAINTENANCE: "MAINTENANCE",
  OFFLINE: "OFFLINE",
};

export const BOOKING_STATUS = {
  BOOKED: "BOOKED",
  VERIFIED: "VERIFIED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  RESCHEDULED: "RESCHEDULED",
  EXPIRED: "EXPIRED",
  NO_SHOW: "NO_SHOW",
  INTERRUPTED: "INTERRUPTED",
};

export const BOOKED_FOR_TYPE = {
  SELF: "SELF",
  GUEST: "GUEST",
};

// Tailwind class fragments keyed by status, so badges stay visually
// consistent with docs Section 19 (Warning = unverified/pending, etc).
export const STATUS_STYLES = {
  AVAILABLE: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  BOOKED: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  OCCUPIED: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  MAINTENANCE: "bg-slate-200 text-slate-600",
  OFFLINE: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  VERIFIED: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  UNVERIFIED: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  ACTIVE: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  COMPLETED: "bg-slate-200 text-slate-600",
  RESCHEDULED: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  NO_SHOW: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
};

// Payment model: clients pay per day booked, at the workstation's flat
// daily rate. No subscriptions, no hour wallet, no bulk/volume discount —
// booking 1 day or 30 days costs the same rate per day.
