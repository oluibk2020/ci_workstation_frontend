# Backend Code Review — vs. Frontend Alignment

Based on the actual backend repository (zip provided 2026-08-31), not just
their spec documents. Real code reveals a lot that documents didn't —
this supersedes guesses made in `BACKEND_ALIGNMENT.md` wherever the two
disagree. Read this after that file, not instead of it.

**Status of the backend itself:** this was early-to-mid stage work in
progress, not a finished API — several routes are still unbuilt, and at
least one documented business rule (identity verification gating
check-in) isn't implemented in code yet. **Update 2026-08-31 (later same
day):** the server-crashing bugs in §1 were patched (see
`PATCH_NOTES.md`), and Oladeji confirmed the server now boots and runs
successfully on his machine against a real local PostgreSQL database —
migrations applied cleanly, workers started. **There is now a live,
locally-running backend** — cancellation/reassignment and
verification-gated check-in are still unbuilt, but basic
auth/branches/workstations/seats/wallet-read/QR endpoints should be
reachable for real testing.

---

## 1. Bugs that currently prevent the server from starting

**✅ Patched 2026-08-31 — see `backend_wkstation_fixed.zip` and its
`PATCH_NOTES.md` for the full changelog.** Verified by actually booting
the server and getting a real HTTP 200 response. Kept here for the
record, since the report itself shouldn't silently change shape.

- **`app.js` requires `./routes/publicUserRoute`, which does not exist in
  this repo.** Their `.gitignore` explicitly excludes
  `publicUserService.js`, `publicUserRoute.js`, `publicUserController.js`
  — these files exist on their machine but were never committed. The
  server cannot boot from this zip as-is. This is the single most
  important thing to flag back to them.
  *(Fixed: `.gitignore` corrected, and all three files reconstructed from
  scratch as a best-effort guess — clearly marked as such in their own
  header comments. The backend team should confirm these match their
  intent or swap in their real originals.)*
- **Case-mismatched `require()` paths**, which work on case-insensitive
  filesystems (Windows, default macOS) but break on Linux (typical
  deployment target):
  - `app.js`: `require("./routes/checkInRoute")` — actual file is
    `checkinRoute.js` (lowercase i). *(Fixed.)*
  - `routes/checkinRoute.js`: `require("../controllers/checkInController")`
    — actual file is `checkinController.js`. *(Fixed.)*
- **`services/paymentService.js` calls `walletService.creditWallet(...)`
  inside `handlePaystackWebhook`, but never imports `walletService`.**
  Would throw `ReferenceError: walletService is not defined` the moment a
  real webhook arrived. *(Fixed: import added.)*
- **The Paystack webhook has no route.** `app.js` sets up raw-body
  middleware for `/api/v1/payments/paystack/webhook`, and
  `paymentController.js` has a working `handlePaystackWebhook` function
  — but `routes/paymentRoute.js` never registers it. Combined with the
  bug above, **wallet funding via Paystack cannot currently complete
  end-to-end**: `verifyPayment` only checks Paystack's status and returns
  it, it never calls `creditWallet` itself. *(Route added; the underlying
  "verify doesn't itself credit the wallet" design is unchanged — that's
  a deliberate architecture choice on their end, not a bug, since the
  webhook is the intended credit path.)*

## 2. Rules from their spec that aren't implemented in code yet

**Status as of 2026-08-31 (second pass): cancellation, reassignment, and
the verification/ban gate on check-in are now implemented** — see
`docs/PATCH_NOTES.md` for the full changelog and design decisions made
along the way. The notification-type crash was patched earlier
(conservative fix, code changed rather than schema).

- ~~**Cancellation and reassignment don't exist.**~~ Implemented:
  `services/cancellationService.js` and `services/reassignmentService.js`
  were both empty (0-line) stubs; both now contain real logic following
  the spec (cancel → non-withdrawable wallet credit, never cash;
  reassignment capped at 3 operations/month, atomic, all-or-nothing), and
  are wired to `POST /bookings/:bookingId/cancel` and
  `POST /bookings/:bookingId/reassign`.
- ~~**Identity verification doesn't gate check-in.**~~ Implemented, and a
  second related gap found and fixed at the same time: banned users
  weren't blocked from check-in either, despite the spec requiring it.
  `checkinService.checkIn` now permanently requires `verificationStatus:
  VERIFIED` and `status: ACTIVE` on every check-in — not just "the literal
  first one." A first-time-only reading was considered and rejected: it
  has a real gap, since a verification later revoked or corrected (e.g.
  fraudulent documents discovered after someone's first visit) wouldn't
  be re-caught on later visits under that reading. A permanent check
  closes that gap and still satisfies the spec's plain requirement, since
  nobody can complete a first check-in without already being verified.
- **Cash funding still has no endpoint.** Left alone deliberately — the
  schema supports it (`CASH_FUNDING` type), but building the actual Super
  Admin credit-a-wallet flow is a decision for the backend team to make
  and own, not something to add alongside bug fixes.
- **`bookingService.js` creates notifications with types
  `"BOOKING_CONFIRMED"` and `"BOOKING_RECEIVED"`**, but the Prisma
  `NotificationType` enum only defines `BOOKING_CREATED` (no
  `BOOKING_CONFIRMED`) and has no `BOOKING_RECEIVED` value at all. This
  would fail at the database level the first time a booking is created.
  *(Patched conservatively: both now use the existing `BOOKING_CREATED`
  value, distinguished by title/message/metadata instead. See
  `PATCH_NOTES.md` for why a schema/migration change was avoided.)*
- **`bookingController.js`'s `getMyBookings`/`getBookingById` read
  `req.user.sub`**, which `authMiddleware.js` never sets (only `.id`) —
  found while wiring the fixes above, not in the original review.
  *(Fixed.)*

## 3. Confirmed decisions — settles what was previously uncertain

- **QR is per-user, fully confirmed.** `QRCode` has no `bookingId` at all
  — just `userId`, `tokenHash`, `status`. `qrCodeService.generateQRCode`
  is called once at registration (every new user gets a wallet *and* a QR
  immediately) and revokes any prior active QR each time it's called
  again ("regenerate" = call generate again). The QR encodes a URL
  (`{FRONTEND_URL}/u/:token`), and `resolveQRCode` looks up *today's*
  booking for that person in the branch's own timezone — a QR with no
  booking today is a valid, non-error response (`currentBooking: null`).
  This fully matches the decision already recorded in
  `BACKEND_ALIGNMENT.md` §3.
- **Gift-a-seat requires a real account, fully confirmed and now precise.**
  `Booking` has separate `bookedByUserId` and `beneficiaryUserId` fields
  — both foreign keys to `User`. The actual field name for "who is this
  for" is **`bookingFor`, valued `"SELF"` or `"OTHER"`** (not `"GUEST"` as
  the frontend's `BOOKED_FOR_TYPE` enum currently says). Gifting to
  someone not yet registered requires the frontend to explicitly pass
  `createBeneficiaryAccount: true` plus a `beneficiaryName` — otherwise
  the backend throws `"BENEFICIARY_NOT_REGISTERED"`, which the booking UI
  should catch and turn into an "invite this person?" prompt.
- **Cash funding stays in scope, fully confirmed** (schema + their
  frozen doc both say so) — just not built yet (see §2 above).

## 4. Real field names and enums the frontend has wrong

These are now certain, not inferred — direct from `schema.prisma` and the
service layer. Frontend still uses the old, differently-shaped versions of
several of these.

| Concept | Frontend currently has | Backend actually has |
|---|---|---|
| Seat status | `AVAILABLE / BOOKED / OCCUPIED / MAINTENANCE / OFFLINE` (5 values) | `ACTIVE / INACTIVE` (2 values) — day-to-day booking status isn't a seat field at all, it's computed from `BookingDate` records via the availability endpoint |
| Workstation status | *(none — didn't exist)* | `ACTIVE / INACTIVE` |
| Branch status | *(none — didn't exist)* | `ACTIVE / INACTIVE` |
| User status | *(none — didn't exist)* | `ACTIVE / BANNED` |
| Whole-booking status | `BOOKED/VERIFIED/ACTIVE/COMPLETED/REASSIGNED/CANCELLED/EXPIRED/NO_SHOW/INTERRUPTED` (9 values) | `ACTIVE / CANCELLED / COMPLETED / EXPIRED` (4 values) |
| Per-date booking status | `BOOKED/ACTIVE/COMPLETED/CANCELLED/REASSIGNED/NO_SHOW` | `ACTIVE / CANCELLED / REASSIGNED / COMPLETED / EXPIRED` |
| Wallet ledger types | `DEPOSIT/CASH_FUNDING/BOOKING_DEBIT/CANCELLATION_CREDIT` | `PAYSTACK_FUNDING / CASH_FUNDING / BOOKING_DEBIT / BOOKING_CANCELLATION_CREDIT / ADMIN_ADJUSTMENT_CREDIT / ADMIN_ADJUSTMENT_DEBIT` |
| Gift-a-seat type | `BOOKED_FOR_TYPE.GUEST` | `bookingFor: "OTHER"` |
| Branch hours fields | `openTime` / `closeTime` | `openingTime` / `closingTime` |
| Branch operating days | `["MON","TUE",...]` | `["MONDAY","TUESDAY",...]` (full names) |
| Workstation price field | `dailyRate` | `pricePerDay` |
| Seat identity field | `code`, plus invented `externalMonitor`/`powerOutlets`/`internetMbps` | just `seatId` (a label string, e.g. `"A1"`) — **the monitor/power/internet spec fields don't exist anywhere in their schema.** Those were a frontend invention from before this schema was available. |

## 5. Real endpoints — corrects the guesses in `BACKEND_ALIGNMENT.md` §9

Their Testing/Deployment Guide's endpoint list turned out to be
aspirational in a few places — the real mounted routes (from `app.js`) are
below. Differences from what was previously assumed are marked.

| Route | Method | Notes |
|---|---|---|
| `/api/v1/auth/register`, `/login`, `/google`, `/me` | POST/POST/POST/GET | matches |
| `/api/v1/wallet` | GET | get own wallet |
| `/api/v1/wallet/transactions` | GET | ⚠️ no `/wallet/fund` — funding goes through Payments, not Wallet |
| `/api/v1/payments/initialize` | POST | starts a Paystack transaction |
| `/api/v1/payments/verify/:reference` | GET | checks Paystack status (does **not** itself credit the wallet — see bug in §1) |
| `/api/v1/branches` | GET | public list |
| `/api/v1/admin/branches` | POST | Super Admin create only — no update/delete route exists yet |
| `/api/v1/workstations/branch/:branchId`, `/:workstationId` | GET | public read |
| `/api/v1/admin/workstations/branch/:branchId`, `/:workstationId`, `/:workstationId/status` | POST/PATCH/PATCH | Super Admin CRUD |
| `/api/v1/seats/workstation/:workstationId`, `/:seatId` | GET | public read |
| `/api/v1/admin/seats/workstation/:workstationId`, `/:seatId`, `/:seatId/status` | POST/PATCH/PATCH | Super Admin CRUD |
| `/api/v1/availability` | GET | `{branchId, workstationId, startDate, endDate}` query params |
| `/api/v1/bookings` | POST/GET | create, list mine — ⚠️ **no `/bookings/:id/cancel` or `/bookings/:id/reassign` exist** (see §2) |
| `/api/v1/bookings/:bookingId` | GET | one booking, includes nested `dates[]` and `reassignments[]` |
| `/api/v1/qr/generate`, `/me`, `/revoke`, `/public/:token` | POST/GET/PATCH/GET | ⚠️ not `/qr/verify` as the deployment doc said |
| `/api/v1/checkin` | POST | ⚠️ singular "checkin", not "checkins"; body is `{bookingDateId, targetUserId?}`, not `{bookingId}` |
| `/api/v1/checkin/:checkInId/checkout` | PATCH | |
| `/api/v1/admin/users`, `/:userId/status`, `/:userId/role` | GET/PATCH/PATCH | list, ban/activate, change role — matches the Admin Clients page's "Make Staff" concept exactly |
| `/api/v1/notifications`, `/:id`, `/:id/read`, `/read-all` | GET×2/PATCH×2 | |

## 6. Error response shape — doesn't match documented API principles

`middleware/errorMiddleware.js` is currently a stub: **every error, from
any source, becomes a flat `{ error: "Internal Server Error..." }` with
HTTP 500** — it doesn't preserve the actual thrown message, doesn't set
different status codes for validation vs. not-found vs. business-rule
failures, and no code anywhere sets a `.code` property on errors (the only
`.code` checks in the codebase are for *Prisma's own* internal codes like
`P2002`/`P2034`, used internally, never surfaced to the client). None of
the documented error codes (`INSUFFICIENT_BALANCE`, `SEAT_UNAVAILABLE`,
etc.) exist in the response today. `api.js`'s `.code`-based error handling
is correctly built for where they're headed, but will get generic 500s
for now — worth knowing when the frontend eventually connects for real,
so a `"Request failed with status 500"` doesn't get mistaken for a crash
when it might just be "insufficient balance."

## 7. New things the frontend hasn't accounted for at all

- **Undocumented required environment variables.** Their Testing/
  Deployment guide's env var list (`NODE_ENV`, `PORT`, `DATABASE_URL`,
  `JWT_SECRET`, `FRONTEND_URL`, `PAYSTACK_SECRET_KEY`,
  `PAYSTACK_PUBLIC_KEY`) is incomplete. Confirmed missing from that list,
  both required for features that are actually wired up in code:
  - `GOOGLE_CLIENT_ID` — `authService.js` throws if unset and someone hits
    Google login.
  - `EMAIL_USER`, `EMAIL_PASS` — `mailService.js` uses Gmail SMTP; without
    these, welcome/booking emails silently fail (non-fatal — wrapped in
    try/catch everywhere it's called — but worth knowing). Gmail requires
    an App Password here, not the account's real password.
- **Google sign-in.** `AuthProvider` enum includes `GOOGLE`;
  `POST /api/v1/auth/google` exists and is fully implemented. No Google
  button exists on `LoginPage`/`RegisterPage` yet.
- **Two-factor auth (TOTP)** — `TwoFactorAuth` model exists, but no route
  currently exposes enabling/using it. Optional per spec; not urgent.
- **Real-time availability via Socket.IO.** `bookingService.js` emits an
  `availability.updated` event after every booking
  (`{branchId, workstationId, seatId, date, availability}`). The frontend
  has no Socket.IO client anywhere. Worth wiring up once Booking (Phase 3)
  is built, so seat availability updates live instead of on refresh.
- **Identity verification has real shape now**: `IdentityVerification` and
  `IDDocument` are separate models — a person can have multiple documents
  under one verification record, each with type
  (`NATIONAL_ID/PASSPORT/DRIVERS_LICENSE/VOTERS_CARD/OTHERS`) and its own
  `DocumentStatus` (`PENDING/ACCEPTED/REJECTED`), distinct from the
  overall `VerificationStatus` on the user. Useful shape reference for
  Phase 5.
- **Booking has two distinct 30-day rules**, not one: a booking can't
  contain more than 30 *operating* days, **and** separately can't be made
  more than 30 *calendar* days in advance. Both are hardcoded constants in
  `bookingService.js` right now (not yet read from `SystemConfig`, despite
  `max_booking_days` being seeded there).

---

## 8. Confirmed live — 2026-08-31, real database

Backend owner ran this against a real PostgreSQL database (`wkstationdb`)
on their own machine: `npm install`, `prisma migrate dev` (all 6
migrations applied cleanly), `prisma generate`, then `npm run dev` —
**server booted successfully** ("Workstation API running on port 1524",
workers started), no module-resolution errors. Confirms the 2026-08-31
patch actually works, not just in this sandbox's stub-Prisma test.

Two new details surfaced while checking the one non-blocking warning in
that log (`mailService.js`'s SMTP connection check, harmless — just means
`EMAIL_USER`/`EMAIL_PASS` aren't set in their `.env` yet):

- **Invited beneficiaries are expected to sign in with Google, not a
  password.** The gift-booking email template explicitly instructs a
  newly-created beneficiary to *"use the Google Login option"* — consistent
  with `bookingService.js` creating their account with `provider: "GOOGLE"`
  and no password hash. **Frontend implication:** the Gift-a-Seat invite
  flow (Phase 3, not yet built) should tell the invited person the same
  thing, and the Login page's eventual Google button becomes load-bearing
  for this flow, not just a convenience option.
- **`services/mailService.js` has a fully-written `sendSuspensionEmail`**,
  but `adminService.js`'s `updateUserStatus` never calls it when banning
  someone — the email exists, the trigger doesn't. Minor, but relevant
  since the frontend's Ban/Reactivate action (Admin → Clients) now exists
  on our side expecting this to eventually notify the person.


## 9. Recommendation (updated 2026-08-31)

The server now boots against a real database — the blocking bugs in §1
are resolved. Cancellation, reassignment, and verification-gated check-in
(§2) are still unbuilt, so live integration for anything touching those
should still wait. But basic, already-implemented flows (auth, branches,
workstations, seats, wallet reads, availability) can likely be smoke-tested
against the real running server now, and the schema-level corrections in
§4 remain safe and worth keeping regardless of integration timing, since
they're taken directly from their committed Prisma schema.
