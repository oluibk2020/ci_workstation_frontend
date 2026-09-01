// Central place for the enums used throughout the docs so copy/labels stay
// consistent wherever a status badge is rendered.
//
// Values below are taken directly from the backend team's committed
// Prisma schema (docs/BACKEND_CODE_REVIEW.md §4) — these are as close to
// certain as anything can be before real integration, since they come
// from their actual schema.prisma, not a spec document's prose.

export const ROLES = {
  CLIENT: "USER",
  MANAGER: "STAFF",
  ADMIN: "SUPER_ADMIN",
};

// Account status — separate from verification. Confirmed: UserStatus enum
// in schema.prisma. Banning/activating is PATCH /admin/users/:id/status.
export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED",
};

// Verification is a submit-then-review flow (profile photo + ID
// document), not a single approve tap at check-in. Confirmed exact match
// to their VerificationStatus enum.
export const VERIFICATION_STATUS = {
  UNVERIFIED: "UNVERIFIED",
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
};

// Branch, Workstation, and Seat each carry their own simple ACTIVE/INACTIVE
// status (confirmed: BranchStatus, WorkstationStatus, SeatStatus in
// schema.prisma — all three are the same two-value enum shape). Whether a
// seat is booked on a given DAY is never a static field on Seat — it's
// computed from BookingDate records via the availability endpoint.
export const BRANCH_STATUS = { ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" };
export const WORKSTATION_STATUS = { ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" };
export const SEAT_STATUS = { ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" };

// Whole-booking status. Confirmed exact match to their BookingStatus enum
// — notably simpler than earlier assumptions: no BOOKED/VERIFIED/
// REASSIGNED/NO_SHOW/INTERRUPTED at this level. Reassignment is tracked
// via a separate BookingReassignment table, not a status value here.
export const BOOKING_STATUS = {
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  EXPIRED: "EXPIRED",
};

// Per-date status, independent of the whole booking's status. Confirmed
// exact match to their BookingDateStatus enum. A single multi-day booking
// can have one date COMPLETED, another ACTIVE, another CANCELLED, all at
// once — cancelling one date must never affect the others.
export const BOOKING_DATE_STATUS = {
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  REASSIGNED: "REASSIGNED",
  COMPLETED: "COMPLETED",
  EXPIRED: "EXPIRED",
};

// "bookingFor" in their actual booking payload — SELF or OTHER (not
// "GUEST"). Booking for OTHER requires an existing account, or
// createBeneficiaryAccount:true + beneficiaryName to invite a new one.
export const BOOKING_FOR = {
  SELF: "SELF",
  OTHER: "OTHER",
};

export const QR_STATUS = {
  ACTIVE: "ACTIVE",
  REVOKED: "REVOKED",
};

export const CHECKIN_STATUS = {
  CHECKED_IN: "CHECKED_IN",
  CHECKED_OUT: "CHECKED_OUT",
};

export const PAYMENT_STATUS = {
  INITIATED: "INITIATED",
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};

// Tailwind class fragments keyed by status, so badges stay visually
// consistent with docs Section 19 (Warning = unverified/pending, etc).
export const STATUS_STYLES = {
  ACTIVE: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  INACTIVE: "bg-slate-200 text-slate-600",
  BANNED: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  VERIFIED: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  PENDING: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  UNVERIFIED: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  REJECTED: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  COMPLETED: "bg-slate-200 text-slate-600",
  CANCELLED: "bg-slate-200 text-slate-600",
  REASSIGNED: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
  EXPIRED: "bg-slate-200 text-slate-600",
  CHECKED_IN: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  CHECKED_OUT: "bg-slate-200 text-slate-600",
  REVOKED: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  SUCCESS: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  FAILED: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  INITIATED: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
};

// Payment model: clients pay per day booked, at the workstation's flat
// daily rate. No subscriptions, no bulk/volume discount. The wallet is the
// only way to pay for a booking. Money enters the wallet two ways —
// Paystack online funding, or a Super Admin cash-funding credit — matching
// their WalletTransactionType enum exactly (schema.prisma).
export const WALLET_TRANSACTION_TYPE = {
  PAYSTACK_FUNDING: "PAYSTACK_FUNDING",
  CASH_FUNDING: "CASH_FUNDING",
  BOOKING_DEBIT: "BOOKING_DEBIT",
  BOOKING_CANCELLATION_CREDIT: "BOOKING_CANCELLATION_CREDIT",
  ADMIN_ADJUSTMENT_CREDIT: "ADMIN_ADJUSTMENT_CREDIT",
  ADMIN_ADJUSTMENT_DEBIT: "ADMIN_ADJUSTMENT_DEBIT",
};
