<p align="center">
  <img src="./docs/assets/charis-logo.png" alt="Charis Intelligence" width="260" />
</p>

<h1 align="center">Work Station — Frontend Build Documentation</h1>
<p align="center"><em>Built for Charis Intelligence</em></p>

<p align="center">
  <img alt="status" src="https://img.shields.io/badge/status-in%20progress-2563EB" />
  <img alt="phase" src="https://img.shields.io/badge/phase-1%20of%208%20complete-16A34A" />
  <img alt="stack" src="https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20Tailwind-0F172A" />
</p>

---

This is a **living document**. It is updated after every build session so that
anyone opening the repo — client, teammate, or future-you — can see exactly
what has been built, what's mocked, and what's next, without reading the
full product spec end to end.

The full product & architecture spec this build follows is
`Work Station — Frontend Product & Architecture Documentation` (Revision 3).
This file tracks *implementation status against that spec* — it does not
replace it.

## Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Build Log](#build-log)
- [Current Limitations / Mocked Behavior](#current-limitations--mocked-behavior)
- [Running the Project](#running-the-project)
- [Design System Reference](#design-system-reference)
- [Roadmap](#roadmap)

---

## Project Overview

Work Station is a workspace-booking platform: clients buy hours, book a desk
by the day (or a range of days), receive a QR pass, and get verified by a
manager on arrival. Clients bring their own laptop — Work Station provides
the desk, power, and internet, not the computer.

Key product decisions this build reflects:

- Booking is **per day**, not per hour.
- **Locations** have their own ID and pricing; only Admins can create them.
- Clients can **gift a seat** to someone else, who checks in with the QR
  code.
- Bookings can span a day, multiple days, or an open date range.
- Bookings **cannot be cancelled** — only rescheduled, and only more than
  48 hours before the start date.
- Managers or Admins **approve unverified clients** on first check-in.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 (`@theme` tokens, no separate config file) |
| Routing | React Router v7 |
| Icons | lucide-react |
| Fonts | Inter (sans), JetBrains Mono (mono/data) |
| Auth (current) | Mocked via `AuthContext` + `localStorage` |
| Backend (planned) | Node.js / Express + Prisma + PostgreSQL (Neon) |

## Repository Structure

```
src/
├── components/
│   ├── common/        Button, Badge, Logo, StatCard, Eyebrow, StatusStrip, ComingSoon, Modal
│   ├── layout/         Navbar, Footer, Sidebar, Topbar, PublicLayout, AuthLayout, DashboardLayout
│   ├── location/       LocationFormModal
│   ├── workstation/     WorkstationFormModal, WorkstationCard
│   ├── client/          DepositModal
│   ├── manager/ admin/ booking/ qr/ approval/ charts/   (empty — future phases)
├── pages/
│   ├── public/          Landing, About, Workstations, Locations, Pricing, HowItWorks, Contact
│   ├── auth/             Login, Register, ForgotPassword, ResetPassword
│   ├── client/           ClientDashboardPage, WalletPage
│   ├── manager/          ManagerDashboardPage, ManagerWorkstationsPage
│   └── admin/            AdminDashboardPage, AdminClientsPage, AdminLocationsPage, AdminWorkstationsPage
├── context/              AuthContext.jsx, UsersContext.jsx, CatalogContext.jsx, WalletContext.jsx
├── services/             api.js, authService.js, locationService.js, workstationService.js, walletService.js
├── utils/                constants.js, navConfig.js, roleRouting.js
└── routes/               ProtectedRoute.jsx
```

## Build Log

### 2026-08-31 (continued) — Phase 3: Booking

Scope: real booking creation and management, using the confirmed exact
payload shapes and business rules from the backend code review — the
first UI built after the backend gaps (cancellation/reassignment) were
patched, so it can actually exercise them for real.

- [x] `publicUserService.js` — calls the reconstructed
      `/public/users/check-email` endpoint (see `docs/PATCH_NOTES.md`).
      Used to check a gift recipient's email *before* submitting, since
      the backend's real "not registered" error gets flattened into a
      generic 500 by their still-stub error middleware and loses its
      specific meaning by the time it reaches the frontend — checking
      first avoids ever hitting that ambiguous case.
- [x] `utils/businessDate.js` — mirrors the backend's
      `helper/businessDate.js` exactly (same weekday names, same UTC
      iteration) so the booking form can gray out non-operating days and
      count business days without a round trip. Backend remains the final
      authority — this is UX only.
- [x] `BookWorkstationPage.jsx` (`/client/book`, also used for
      `/client/gift-a-seat`) — full flow: branch → workstation type →
      self-or-gift → continuous-date-range or specific-days → live
      availability check (`GET /availability`) → seat selection (only
      seats free across *every* requested date are selectable) → price
      preview → submit. Handles both `bookingFor` values and the
      exists-vs-invite branches of gifting.
- [x] `MyBookingsPage.jsx` (`/client/bookings`) — lists bookings with
      per-date status (a single booking can show one date `COMPLETED`,
      another `ACTIVE`, another `CANCELLED` simultaneously — matches the
      real `BookingDate` model). Cancel and Reassign actions per active
      date, wired to the newly-patched backend endpoints.
- [x] Routes wired in `App.jsx`, replacing the `ComingSoon` placeholders
      for `/client/book`, `/client/bookings`, `/client/gift-a-seat`.
- [x] Production build + lint verified clean (0 errors).

**Known constraint, not a bug:** testing a real booking end-to-end
requires actual wallet balance, which requires either a real Paystack key
(not configured yet) or the still-unbuilt cash-funding endpoint. The UI
is honest about insufficient balance (shows it, doesn't block submission
client-side) rather than pretending this is solved.

**Not done:** the review-and-confirm screen doesn't yet show anything for
already-cancelled/reassigned history beyond the per-date badges on the
list — a dedicated "audit trail" view of past reassignments would be a
reasonable next addition, not attempted here.

---

### 2026-08-31 (continued) — Frontend wired to the real backend

Scope: replace mocked auth/catalog/wallet with real network calls against
the now-running backend (confirmed live per `docs/PATCH_NOTES.md`), for
every flow that's actually implemented server-side.

- [x] `AuthContext`/`authService` — real register/login/me. Caught and
      worked around a real backend inconsistency: their `register`
      controller nests the response one level deeper than `login`'s
      (`{user: {user, token, qrCode}}` vs `{user, token}`) —
      `normalizeAuthResult()` handles both shapes so nothing downstream
      has to know.
- [x] `CatalogContext`/`branchService`/`workstationService`/`seatService`
      — real Branch → Workstation → Seat reads, admin mutations call only
      the endpoints that actually exist (no branch update/delete, no
      workstation/seat delete — none of those routes exist on their side).
  - **Bug fixed:** seat endpoints require auth on their backend
    (`routes/seatRoute.js`), but seats were being fetched unconditionally
    — a 401 for anyone logged out was corrupting the whole catalog's error
    state even though branches/workstations (genuinely public) loaded
    fine. Split seat loading out to only run while authenticated, re-fires
    automatically on login. Public `WorkstationsPage` now shows a clean
    "log in to see live seats" state instead of an error.
- [x] `WalletContext`/`walletService` — real balance + transaction history
      reads. `deposit` now throws rather than faking a balance change —
      no Paystack key configured yet, and cash funding still has no real
      endpoint (see `docs/BACKEND_CODE_REVIEW.md` §2).
- [x] `AdminClientsPage`/`adminUserService` — real user list, role change,
      ban/reactivate against `PATCH /admin/users/:id/{role,status}`. The
      "Credit Wallet" action was removed (no real endpoint exists for it).
- [x] New `QRPage.jsx` (`/client/qr`) — the one backend feature that's
      fully implemented and needs no external credentials to use.
      Documented a real UX constraint while building it: `GET /qr/me`
      never returns the scannable token, only `generate()` does, and
      generating always revokes whatever QR existed before. The page is
      built around that constraint rather than hiding it.
- [x] `api.js` — updated to handle their error middleware actually being a
      stub: every failure (auth or otherwise) currently comes back as a
      flat 500 with shape `{error: "..."}`, not the documented
      `{success, message, code}`. `apiFetch` now falls back to `.error`,
      attaches the real HTTP status, and flags `isGenericServerError` so
      callers can be honest about what they don't know instead of
      guessing a specific reason.
- [x] `LoginPage`/`RegisterPage` — removed dead `NO_ACCOUNT`/`ACCOUNT_BANNED`
      code checks left over from the old mocked auth (real backend never
      sets `.code` on these paths). Error copy now says plainly that the
      backend doesn't yet return specific failure reasons, rather than
      pretending to know why a login or registration failed.
- [x] `.env` created from `.env.example`, pointing at
      `http://localhost:1524/api/v1`.
- [x] Production build + lint verified clean (0 errors).

**Not done:** booking creation/list UI (Phase 3) — the backend supports it
now, but building the actual date-picker/continuous-vs-flexible booking
flow is a bigger, separate piece of work, not "wiring an existing page."
Flagging it as the natural next candidate.

---

### 2026-08-31 — Live backend wiring + backend gaps implemented

Two-part session, prompted by the backend owner confirming their server
boots against a real database (`prisma migrate dev` succeeded, `npm run
dev` → "Workstation API running on port 1524").

**Part 1 — backend gaps implemented** (in the backend repo, not this
one — see the delivered `backend_wkstation` zip and its `PATCH_NOTES.md`):
- `cancellationService.js` and `reassignmentService.js` — were empty
  0-line stubs, now contain real logic matching the functional spec
  (cancel → non-withdrawable wallet credit to the booker, never cash;
  reassignment capped at 3 operations/month, atomic, all-or-nothing).
  Wired to new `POST /bookings/:bookingId/cancel` and
  `POST /bookings/:bookingId/reassign` routes.
- `checkinService.checkIn` — added the verification gate the spec
  required but the code never enforced (blocks a person's very first
  check-in unless `verificationStatus === VERIFIED`).
- All three syntax-checked and boot-tested (stub Prisma client, same
  method as the first backend patch) — `app.js` still loads with zero
  `require()` errors. **Not tested against a real database from this
  session** — flagged clearly in `PATCH_NOTES.md` for the backend owner
  to verify directly.

**Part 2 — frontend wired to the real, running backend:**
- `AuthContext` — real `login`/`register`/`me` via `authService`, JWT
  persisted and sent on every request. Handles a real backend quirk
  found in the process: their `register` endpoint double-wraps its
  response one level deeper than `login` does (variable-naming collision
  in their controller) — normalized so the rest of the app never has to
  know.
- `CatalogContext` — branches/workstations/seats now load for real on
  mount. Admin mutations call only the endpoints that actually exist
  server-side: branch create-only (no update/delete route exists yet);
  workstation and seat create/update/status all exist and are wired.
  Decimal fields (`pricePerDay`) normalized from the strings Prisma
  serializes them as.
- `WalletContext` — balance and transaction history are real
  (`GET /wallet`, `GET /wallet/transactions`). `deposit` deliberately
  throws rather than faking a balance change — funding can't complete
  end-to-end yet (no Paystack keys configured, and cash funding has no
  endpoint at all).
- New `adminUserService.js`, `branchService.js`, `seatService.js` — real
  confirmed endpoints. `UsersContext` (the old mocked account directory)
  is fully retired — `AdminClientsPage` now calls `adminUserService`
  directly with real loading/error states.
- `bookingService.js` — `cancel`/`reassign` re-enabled now that Part 1
  gives them somewhere real to call.
- `.env.example` added (`VITE_API_BASE_URL=http://localhost:1524/api/v1`).
- Production build + lint verified clean (0 errors).

**Still not live:** Booking itself (Phase 3 UI was never built), QR/
check-in screens (Phase 5), wallet funding (blocked on Paystack config +
the cash-funding endpoint that doesn't exist). Cancellation/reassignment
now have a real backend to call whenever Booking is eventually built.

---

### 2026-08-31 — Backend code review: applied schema-confirmed corrections

Scope: the backend team's actual GitHub repo (zip) was reviewed line by
line — Prisma schema, routes, controllers, services. Full findings in the
new `docs/BACKEND_CODE_REVIEW.md`, which supersedes `BACKEND_ALIGNMENT.md`
wherever the two disagree (real code beats spec prose). **The backend
itself cannot currently start** (missing `publicUserRoute.js`, excluded by
their own `.gitignore`) and several documented rules aren't implemented
yet (cancellation, reassignment, verification-gated check-in, cash
funding) — so this remains schema/contract alignment only, not live
integration.

- [x] `constants.js` — every enum rewritten to match `schema.prisma`
      exactly: `SEAT_STATUS`/`WORKSTATION_STATUS`/`BRANCH_STATUS`
      simplified from a 5-value guess down to their real `ACTIVE/INACTIVE`;
      added `USER_STATUS` (`ACTIVE/BANNED`); `BOOKING_STATUS` simplified
      to their real 4 values (no BOOKED/VERIFIED/REASSIGNED/NO_SHOW at
      this level — reassignment is a separate table); `BOOKING_DATE_STATUS`
      corrected; wallet ledger types renamed to their real
      `PAYSTACK_FUNDING/CASH_FUNDING/BOOKING_DEBIT/BOOKING_CANCELLATION_CREDIT/
      ADMIN_ADJUSTMENT_CREDIT/ADMIN_ADJUSTMENT_DEBIT`; `BOOKED_FOR_TYPE`
      renamed to `BOOKING_FOR` with real values `SELF/OTHER` (not `GUEST`).
- [x] `CatalogContext.jsx` — `openTime`/`closeTime` → `openingTime`/
      `closingTime`; operating days now full weekday names (`"MONDAY"` not
      `"MON"`); `dailyRate` → `pricePerDay`; **removed the seat spec fields
      entirely** (`externalMonitor`, `powerOutlets`, `internetMbps`) — they
      don't exist anywhere in the real schema. A seat is just a label
      (`seatId`) and a status.
- [x] `SeatFormModal`, `SeatCard` rewritten to the real minimal shape.
      `BranchFormModal`, `AdminBranchesPage`, `AdminWorkstationsPage`,
      `AdminSeatsPage`, `StaffSeatsPage`, public `WorkstationsPage`,
      `PricingPage`, `LandingPage`, `BranchesPage` all updated to match.
- [x] `UsersContext` — added `status` (`ACTIVE/BANNED`) and `setStatus`,
      confirmed real (`PATCH /admin/users/:userId/status`,
      `adminService.js`). `AuthContext.login` now blocks banned accounts.
- [x] `AdminClientsPage` — added Ban/Reactivate action; both it and the
      role-change action are now hidden on the admin's own row (their
      `adminService.js` explicitly disallows self-modification).
- [x] Service stub files corrected to real, confirmed endpoints:
  - `qrService.js` — real paths are `/qr/generate`, `/qr/me`,
    `/qr/revoke`, `/qr/public/:token` (not `/qr/verify`).
  - `checkinService.js` — path is singular `/checkin` (not `/checkins`);
    keyed by `bookingDateId`, not `bookingId`; `targetUserId` optional
    (self-check-in is allowed, not staff-only as the spec implied).
  - `walletService.js` — removed the guessed `/wallet/fund` endpoint;
    wallet only exposes reads. Funding is a Payments concern.
  - New `paymentService.js` — the real Paystack flow
    (`/payments/initialize`, `/payments/verify/:reference`). Documented
    that their webhook can't currently credit the wallet end-to-end (see
    code review §1).
  - `bookingService.js` — exact real payload shape (`bookingFor`,
    `beneficiaryEmail`/`beneficiaryName`/`createBeneficiaryAccount`,
    `type: CONTINUOUS|FLEXIBLE`, etc.). `cancel`/`reassign` commented out
    — no endpoint exists for either yet.
- [x] Production build + lint verified clean (0 errors).

**Not changed:** no live network calls wired up anywhere — there's still
no backend to integrate against (it can't start), so everything above is
contract alignment for whenever that's fixed on their end.

---

### 2026-08-24 — Decision: follow the backend on both flagged conflicts

Resolves the two items flagged in the previous session's entry. Full
reasoning in `docs/BACKEND_ALIGNMENT.md` §3 and §4.

- [x] **QR model → per-user** (not per-booking). The backend's test cases
      ("QR belonging to another user", "QR without a booking") only make
      sense under a per-user model. Corrected `LandingPage.jsx`'s
      Gift-a-Seat copy, which had said "no account needed on their end" —
      that's no longer accurate, since checking in now requires the
      account's own QR. Everything else already described QR as per-user
      (written before an earlier correction reached me, and never actually
      reverted) — those pages needed no change.
- [x] **Cash funding → kept.** The backend's frozen documentation lists it
      as a launch requirement. The feature was already fully built
      (`WalletContext.creditUserWallet`, the "Credit Wallet" action in
      `AdminClientsPage`, `CASH_FUNDING` ledger type) from before
      development paused — nothing needed reverting.
- [x] `qrService.js`, `walletService.js` — comments updated from "flagged,
      needs your decision" to reflect the final resolution. Added
      `walletService.creditCashFunding` (path is a reasonable guess
      following their existing REST conventions — confirm against their
      real API spec, Doc 4, once available).
- [x] Production build verified clean.

---

### 2026-08-24 — Backend doc review: Testing/Deployment/Maintenance Guide (Doc 7 of 7)

Scope: applied everything safely inferable from the backend team's newly
shared testing/deployment guide; flagged two reopened conflicts rather
than silently resolving them. Full detail in `docs/BACKEND_ALIGNMENT.md` §9.

- [x] `api.js` — rewritten to match the confirmed response envelope
      (`{ success, message, data }` / `{ success, message, code }`),
      unwrapping `data.data` automatically and attaching `.code` to thrown
      errors. Default base URL now `/api/v1` per their versioning rule.
- [x] `walletService.js` — fixed endpoint to the confirmed `/wallet/fund`
      (was guessing `/wallet/deposit/initialize`).
- [x] New stub services with confirmed real endpoints, not yet called by
      any UI: `bookingService.js`, `qrService.js`, `checkinService.js`.
- [x] `constants.js` — added `BOOKING_DATE_STATUS`, separate from the
      whole-booking `BOOKING_STATUS` (their guide's diagram shows one
      booking can have dates simultaneously COMPLETED/ACTIVE/CANCELLED).
- [x] Branch entity gained `openTime`, `closeTime`, `timezone`,
      `operatingDays` — confirmed fields we were missing. Updated
      `CatalogContext`, `BranchFormModal`, `AdminBranchesPage`, public
      `BranchesPage`.
- [x] Production build verified clean.

**🔴 Two decisions reopened by this document, not yet acted on:**
1. **Cash funding** — their frozen doc's pre-launch checklist lists "Cash
   funding works" as required, reconfirming the feature from their first
   spec. Conflicts with this project's "no cash payment" decision.
2. **QR model** — their test cases ("QR belonging to another user", "QR
   without a booking") imply QR is per-user, not per-booking. Conflicts
   with this project's "QR is per-booking" decision.

Neither was changed in code — both need your call before touching
anything QR- or cash-funding-related.

**Still missing:** Documents 1–6 (functional spec, DB/Prisma schema, API
spec, service architecture, implementation guide) — this was only Doc 7.
Booking (Phase 3) shouldn't be built with confidence until at least the
API spec and Prisma schema are available.

---

### 2026-08-24 — ⏸ Development paused pending backend team's actual files

Frontend is in a clean, stable state (build + lint pass). Pausing further
work until the backend team's real code (schema, endpoints, etc.) is
available — a spec document doesn't always match the eventual
implementation, so building further on assumptions risks more rework.

**Open item when resuming:** the cash-funding wallet feature
(`WalletContext.creditUserWallet`, the "Credit Wallet" action in
`AdminClientsPage`, `CASH_FUNDING` in `constants.js`/`walletService.js`)
needs to be removed — it was built against an earlier reading of the spec
that's since been overridden by a deliberate product decision: no cash
payment, Paystack-only. See `docs/BACKEND_ALIGNMENT.md` §4.

**Next steps when backend files arrive:**
1. Re-check `docs/BACKEND_ALIGNMENT.md` against the actual schema/code —
   specs and implementations can drift.
2. Strip the cash-funding feature per the note above.
3. Resume with either Phase 3 (Booking) or the docx Revision 6, whichever
   is prioritized.

---

### 2026-08-23 — Fix: removed exposed role picker; Admin can now promote Clients to Manager

**Final login/role system is pending confirmation from the backend team —
everything here is a mocked stand-in, not a design decision.**

- [x] `UsersContext` — new mock account directory (separate from
      `AuthContext`, which only tracks who's logged in on this device).
      Seeded with 3 sample Clients and one bootstrap Admin account not
      surfaced anywhere in the UI.
- [x] `AuthContext.login` — no longer accepts a role. It looks up the email
      in `UsersContext`; unknown emails now fail with a clear "no account
      found, try registering" message instead of silently logging in.
- [x] `AuthContext.register` — always creates a Client via
      `UsersContext.registerClient`. There is no public path to a Manager
      or Admin account.
- [x] `LoginPage.jsx` — role picker removed entirely; back to a plain
      email/password form.
- [x] `AdminClientsPage.jsx` (`/admin/clients`, previously `ComingSoon`) —
      real page: search clients, "Make Manager" / "Revert to Client"
      per row. This is the only way a Manager account comes to exist.
- [x] `main.jsx` — `UsersProvider` now wraps `AuthProvider` (added as the
      outermost provider, since Auth depends on it).
- [x] `README.md` — documented the seeded admin credential for development
      use, explicitly flagged as not part of the product UI.
- [x] Production build + lint verified clean (0 errors; 7 pre-existing
      style warnings, same category as before).

**Notes:** This directly reverses the previous session's role-picker
convenience feature, at the person's request — exposing a role switch on
login, even for demo purposes, risked normalizing "log in as whatever role
you want" as a pattern, which doesn't reflect how the real system should
work. The one seeded Admin account is a deliberate exception (a real
backend needs a root admin created out-of-band too) but is kept out of any
UI copy, hints, or placeholder text.

---

### 2026-08-23 — Feature: Client Wallet (cash deposits, no expiry) ✅

Scope: matches Revision 5 of the product documentation — reintroduces a
wallet, but as a plain cash balance, not the hours/subscription model
removed in Revision 4.

- [x] `WalletContext` — new per-client cash balance, persisted to
      localStorage keyed by user id (mocked; survives refresh, resets if
      you log in as a different demo user). Seeded with a sample deposit +
      payment so the page isn't empty on first login.
- [x] `walletService.js` — placeholder service for the future backend;
      matches the doc's rule that a deposit must be verified server-side
      with the payment provider before the balance is credited.
- [x] `DepositModal.jsx` — quick-amount buttons (₦5k/10k/20k/50k) or a
      custom amount; explicitly states the balance never expires.
- [x] `WalletPage.jsx` (`/client/wallet`) — balance hero, "Add funds"
      button, full transaction history (deposits green, payments red).
- [x] `navConfig.js` — "My Wallet" added back to the Client sidebar.
- [x] `ClientDashboardPage.jsx` — "Total spent this month" stat replaced
      with a live "Wallet balance" stat, linking through to the Wallet page.
- [x] `main.jsx` — `WalletProvider` wired inside `AuthProvider` (wallet is
      per-user, so it needs `useAuth` to know who's logged in).
- [x] Production build + lint verified clean (0 errors; 6 pre-existing
      style warnings, same category as before — two more from `WalletContext`'s
      load/persist effects, same pattern as `AuthContext`).

**Notes:** This is deliberately *not* a return to the old Hour Wallet. No
plans, no bundles, no discount for depositing more, no expiry. The wallet
is just an optional payment method sitting alongside direct payment — both
result in the same flat per-day booking total. `pay()` is exposed on
`WalletContext` for the future Booking flow (Phase 3) to debit against, but
isn't wired to anything yet since there's no booking checkout screen.
Master documentation is now **Revision 5** — Section 13 renamed "Booking
Payments and Client Wallet", with a new `WalletTransaction` entity in the
data model and a new Wallet-deposit flow in Section 22.

---

### 2026-08-23 — Fix: explicit role picker replaces email-prefix convention

- [x] `AuthContext.login` no longer infers role from the email address
      (`manager@...` / `admin@...`). It now accepts an explicit `role`
      parameter, defaulting to `CLIENT`.
- [x] `LoginPage.jsx` — added a demo-only role picker (Client / Manager /
      Admin) so any email can log in as any role, rather than requiring a
      specific email prefix to reach the Manager/Admin dashboards.
- [x] `README.md` — updated the mocked-auth note to match.

**Notes:** This only affects the mocked demo login. Once the real backend
exists, the role comes from the account record — the picker goes away
entirely rather than needing to be adapted.

---

### 2026-08-23 — Phase 2: Locations & Workstations ✅

Scope: Section 25 (MVP Development Phases), Phase 2 — location creation
(Admin only) with per-location pricing, and full workstation CRUD with
status management.

- [x] `CatalogContext` — new in-memory data layer for locations + workstations,
      seeded with the existing Sagamu/Lekki sample data. CRUD function shapes
      (`add`/`update`/`remove`) are designed to map 1:1 onto real
      `locationService`/`workstationService` calls later — swapping mocked
      state for `apiFetch` calls is the only change needed.
- [x] `locationService.js`, `workstationService.js` — placeholder service
      files wired for the future backend (not yet called; `CatalogContext`
      is still mocked)
- [x] `components/common/Modal.jsx` — shared modal, used by both forms
- [x] `components/location/LocationFormModal.jsx` — create/edit location
      (name, address, default daily rate)
- [x] `components/workstation/WorkstationFormModal.jsx` — create/edit
      workstation (code, location, desk type, seating, monitor, power,
      internet, daily rate, status on edit)
- [x] `components/workstation/WorkstationCard.jsx` — shared card used by
      both Admin (editable) and Manager (read-only) workstation views
- [x] `AdminLocationsPage.jsx` — full CRUD; delete is blocked with an
      inline error if workstations still reference that location
- [x] `AdminWorkstationsPage.jsx` — full CRUD + inline status dropdown,
      filterable by location
- [x] `ManagerWorkstationsPage.jsx` — read-only status monitoring per docs
      Section 3.2 (Managers monitor status; only Admins edit/create/delete)
- [x] Public site (`LandingPage`, `WorkstationsPage`, `LocationsPage`,
      `PricingPage`) refactored off hardcoded arrays onto `CatalogContext`,
      so an Admin creating a location/workstation shows up on the public
      site immediately, within the session
- [x] Production build + lint verified clean (4 pre-existing style warnings,
      0 errors — same pattern already used in `AuthContext`)

**Notes:** Location deletion is blocked (not cascaded) if workstations still
reference it — matches the spirit of the doc's admin-only location control
without silently orphaning data. No pagination/search yet on either admin
list; fine at this data size, worth revisiting once this is real API data.

---

### 2026-08-23 — Product change: removed hourly subscription/wallet, flat per-day pricing

Scope: matches Revision 4 of the product documentation.

- [x] Removed the Hour Wallet / subscription bundle model (Starter/Pro/Business)
      entirely. Clients now pay a flat daily rate per booking, multiplied by
      the number of days booked — **no discount regardless of volume**.
- [x] `PricingPage.jsx` rewritten — shows sample per-location/desk daily
      rates and a worked example instead of hour bundles.
- [x] `LandingPage.jsx` and `HowItWorksPage.jsx` — "Buy hours" step replaced
      with "Pay per day"; pricing preview section now shows real daily
      rates instead of plan cards.
- [x] `ClientDashboardPage.jsx` — "Hours left" stat replaced with "Total
      spent this month"; sample bookings now show what was paid.
- [x] `AdminDashboardPage.jsx` — "Hours sold"/"Hours used" replaced with
      "Total days booked"/"Avg. days per booking".
- [x] `navConfig.js` — removed "My Subscription" (client) and
      "Subscriptions" (admin); "Transactions" renamed to "Payment History".
- [x] `App.jsx` — removed the now-dead subscription routes.
- [x] `constants.js` — removed `DEFAULT_DAILY_HOUR_VALUE`.
- **Notes:** this also updates the master product documentation
  (`Work Station — Frontend Product & Architecture Documentation`,
  now Revision 4) — Section 13 ("Client Subscriptions and Hour Wallet") was
  replaced with a new Section 13 ("Booking Payments (Pay-Per-Day)"), and the
  data model dropped the `SubscriptionPlan`/`Subscription`/`Transaction`
  entities in favor of a `Payment` tied directly to each `Booking`.

---

### 2026-08-23 — Asset update: high-res Charis Intelligence logo

- [x] Replaced the low-res (214×87) logo with a proper high-DPI version
      (1812×868 source, trimmed and resized to 900×424 for web/doc use).
      Same treatment as before: white-background and transparent versions
      both saved.
- **Note:** no more upscaling artifacts — this is the source-quality logo
  now, not a stretched approximation.

---

### 2026-08-23 — Content update: Ikeja → Sagamu

- [x] Renamed the "Ikeja" sample location to **Sagamu** across all mock data:
      status strip, landing page (features copy, workstation showcase),
      Workstations page, Locations page (address corrected to
      Akarigbo Road, Sagamu, Ogun State — Ikeja's address doesn't apply),
      About page, and the client dashboard's sample bookings.
- **Note:** this is a content-only rename in mock data. Once `Location` is a
  real entity (Phase 2), this will just be a row in the database rather than
  a find-and-replace across components.

---

### 2026-08-23 — Fix: back-to-home link on auth screens

- [x] Added an explicit "← Back to home" link to `AuthLayout` (shared by
      Login, Register, Forgot Password, and Reset Password), so navigating
      back to the landing page doesn't rely on people noticing the logo is
      clickable.

---

### 2026-08-23 — Phase 1: Foundation ✅

Scope: Section 26 (Recommended Development Order), steps 1–8.

- [x] Vite + React project scaffolded
- [x] Tailwind v4 configured with the doc's Section 19 color tokens
- [x] Inter + JetBrains Mono type system
- [x] `PublicLayout`, `AuthLayout`, `DashboardLayout`
- [x] Navbar, Footer, role-driven Sidebar, Topbar
- [x] `AuthContext` (mocked) — login infers role from email prefix for demo purposes
- [x] `ProtectedRoute` guard (role-based, UI-level only — backend must still enforce)
- [x] Public site: Landing (with live "status strip" hero), Workstations, Locations,
      Pricing, How It Works, About, Contact
- [x] Auth screens: Login, Register (flags new accounts `UNVERIFIED`), Forgot/Reset Password
- [x] Client, Manager, Admin dashboard shells matching the doc's wireframes
- [x] `ComingSoon` placeholders wired into every sidebar route so nothing 404s
- [x] Production build verified clean (`npm run build`)

**Not started yet:** anything touching real data — see [Roadmap](#roadmap).

<!--
  Add new entries above this line, newest first. Suggested entry shape:

  ### YYYY-MM-DD — Phase N: <name> ✅ / 🚧
  Scope: <what part of the spec this covers>
  - [x] done item
  - [ ] not done item
  **Notes:** anything a teammate should know (gotchas, deviations from spec, decisions made).
-->

## Current Limitations / Mocked Behavior

Things that look real in the UI but are not yet wired to a backend:

- **Auth** — `AuthContext` fakes login/register against `UsersContext` +
  `localStorage`. Public login/register always produces a Client; Manager
  accounts only exist if an Admin promotes one via **Admin → Clients**. See
  `README.md` for the seeded development-only Admin credential (not
  exposed anywhere in the product UI). **This entire system is a stand-in
  pending the backend team's confirmation of the real login/role design.**
- **Dashboard numbers** — booking counts, revenue, etc. are hardcoded
  sample data in each dashboard page (Wallet balance is the exception —
  see below, it's live).
- **Wallet** — real balance and transaction history via `WalletContext`,
  persisted to localStorage per user id (in-memory equivalent — resets if
  you clear browser storage, not yet backed by a real payment provider or
  database).
- **Locations & workstations** — now real CRUD against `CatalogContext`
  (in-memory, resets on page refresh — not yet persisted to a backend).
- **Bookings, sessions, QR passes, approvals** — no screens exist yet; sidebar
  links go to a labeled placeholder.

## Running the Project

```bash
npm install
npm run dev       # local dev server
npm run build     # production build
npm run preview   # preview the production build
```

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` once the backend
exists.

## Deployment Notes

> Tracked here so it isn't forgotten once we get to deployment.

- [ ] **`vercel.json` — not yet created.** Needed before deploying to Vercel for two reasons:
  1. SPA fallback — React Router needs all paths rewritten to `/index.html`, or a hard refresh on any non-root route (e.g. `/client/dashboard`) will 404.
  2. API proxy rewrite — consistent with the pattern used on your other projects (OY-ZAIR, Shally), route `/api/*` through a Vercel rewrite to the Express backend once it's deployed, to avoid cross-domain cookie/CORS issues.
- [x] `.env` created locally from `.env.example` (already covered by `.gitignore` — won't be committed).

## Design System Reference

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#0F172A` | Navigation, headings, dark UI |
| `--color-accent` | `#2563EB` | Primary actions, links |
| `--color-success` | `#16A34A` | Available / verified / active |
| `--color-warning` | `#F59E0B` | Unverified, pending approval, reschedule alerts |
| `--color-danger` | `#DC2626` | Errors, no-show |
| `--color-bg` | `#F8FAFC` | Page background |

Fonts: `Inter` for UI text, `JetBrains Mono` for data, badges, prices, and
status readouts (see `.font-mono-tight` utility).

## Roadmap

Tracking against Section 25 (MVP Development Phases) of the spec.

- [x] **Phase 1 — Foundation**
- [x] **Phase 2 — Locations & Workstations** (Admin-only location creation, per-location pricing, workstation CRUD)
- [ ] **Phase 3 — Booking** (day-range picker, Gift a Seat, 48-hour reschedule rule)
- [ ] **Phase 4 — Payments** (per-day checkout, flat rate, no wallet)
- [ ] **Phase 5 — QR & Verification** (QR generation/scanning, unverified-client approval step)
- [ ] **Phase 6 — Sessions** (active session tracking, history)
- [ ] **Phase 7 — Analytics** (admin reports, audit logs)
- [ ] **Phase 8 — Real-Time** (Socket.IO — live status, live approvals)

---
<p align="center"><sub>Charis Intelligence · Work Station Frontend · updated with every build session</sub></p>
