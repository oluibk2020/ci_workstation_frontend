// Central place for the enums used throughout the docs so copy/labels stay
// consistent wherever a status badge is rendered.
//
// Role, status, and ledger-type VALUES below are aligned to the backend
// team's technical specification — see docs/BACKEND_ALIGNMENT.md for the
// full comparison against what the frontend had before that spec existed.

export const ROLES = {
  CLIENT: "USER", // backend calls this role USER; "Client" is just our UI copy
  MANAGER: "STAFF", // backend calls this role STAFF
  ADMIN: "SUPER_ADMIN", // backend calls this role SUPER_ADMIN
};

// Backend requires all four — verification is a submit-then-review flow
// (profile photo + ID document), not a single approve tap at check-in.
export const VERIFICATION_STATUS = {
  UNVERIFIED: "UNVERIFIED",
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
};

// Status lives on the SEAT (the bookable unit), not the Workstation (the
// type/category that holds the price). See CatalogContext.
export const SEAT_STATUS = {
  AVAILABLE: "AVAILABLE",
  BOOKED: "BOOKED",
  OCCUPIED: "OCCUPIED",
  MAINTENANCE: "MAINTENANCE",
  OFFLINE: "OFFLINE",
};

// Whole-booking status.
export const BOOKING_STATUS = {
  BOOKED: "BOOKED",
  VERIFIED: "VERIFIED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  REASSIGNED: "REASSIGNED", // a date was moved to another date/branch/workstation/seat
  CANCELLED: "CANCELLED", // date released, value returned as wallet credit — never a cash refund
  EXPIRED: "EXPIRED",
  NO_SHOW: "NO_SHOW",
  INTERRUPTED: "INTERRUPTED",
};

// Per-date status, independent of the whole booking's status — confirmed by
// the Testing/Deployment/Maintenance Guide §3: a single multi-day booking
// can have one date COMPLETED, another ACTIVE, another CANCELLED, all at
// once. Cancelling one date must never affect the others in the same
// booking.
export const BOOKING_DATE_STATUS = {
  BOOKED: "BOOKED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REASSIGNED: "REASSIGNED",
  NO_SHOW: "NO_SHOW",
};

export const BOOKED_FOR_TYPE = {
  SELF: "SELF",
  GUEST: "GUEST", // must resolve to an existing or newly-invited real account — see alignment doc §7
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
  PENDING: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  UNVERIFIED: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  REJECTED: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  ACTIVE: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  COMPLETED: "bg-slate-200 text-slate-600",
  REASSIGNED: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  CANCELLED: "bg-slate-200 text-slate-600",
  NO_SHOW: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
};

// Payment model: clients pay per day booked, at the workstation's flat
// daily rate. No subscriptions, no bulk/volume discount. Per the backend
// spec, the WALLET IS THE ONLY WAY TO PAY FOR A BOOKING — there is no
// direct card payment at checkout. Money enters the wallet two ways only:
// Paystack online funding, or a Super Admin cash-funding credit.
export const WALLET_TRANSACTION_TYPE = {
  DEPOSIT: "DEPOSIT", // online funding via Paystack
  CASH_FUNDING: "CASH_FUNDING", // Super Admin credits a wallet for an authorized cash payment
  BOOKING_DEBIT: "BOOKING_DEBIT", // wallet debited to pay for a booking
  CANCELLATION_CREDIT: "CANCELLATION_CREDIT", // non-withdrawable credit from a cancelled future date
};
