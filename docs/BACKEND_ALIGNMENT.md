# Backend Alignment — Comparison & Decisions

Generated when the backend team delivered their technical specification.
Records every discrepancy found between the frontend (as built) and the
backend spec, plus the decisions made on how to resolve each one. Treat
this as a permanent record — check future changes on either side against
it.

**Status key:** ✅ Resolved & implemented in code · 🟡 Resolved, code not
yet updated · 🔵 Deliberate divergence from the backend doc (by choice) ·
⚪ Still open / needs input

---

## 1. Roles — ✅ resolved, follow backend exactly

| Frontend had | Backend requires | Decision |
|---|---|---|
| `CLIENT` | `USER` | Adopt backend naming. |
| `MANAGER` | `STAFF` | Adopt backend naming. Routes moved `/manager/*` → `/staff/*`. |
| `ADMIN` | `SUPER_ADMIN` | Adopt backend naming. |

Implemented: `constants.js`, all routes, nav config, sidebar labels, page
folders (`pages/staff/...`).

## 2. Entity model — ✅ resolved, Branch → Workstation → Seat

Backend hierarchy: **Platform → Branch → Workstation → Seat**, price on
Workstation, status on Seat. Frontend had collapsed all three into one
entity. Rebuilt `CatalogContext` and all Admin/Staff/public pages around
the correct three-entity model.

Implemented: `CatalogContext.jsx`, `AdminBranchesPage`, `AdminWorkstationsPage`,
`AdminSeatsPage`, `StaffSeatsPage`, public `BranchesPage`/`WorkstationsPage`/`PricingPage`.

## 3. QR identity — ✅ resolved (final): per-user, following the backend

This went through two flips — worth recording the full history so it isn't
re-litigated by accident later:

1. Backend's first spec said *"each user has one active personal QR
   identity,"* which I read as per-user.
2. You corrected that to per-booking.
3. Their Testing/Deployment/Maintenance Guide then surfaced test cases
   ("QR belonging to another user," "QR without a booking") that only make
   sense if QR is per-user — a QR existing with no booking attached is not
   a coherent scenario under a per-booking design.
4. **Final decision: follow what the backend actually sent — QR is a
   persistent personal identity per user account**, not generated per
   booking. Regenerating it revokes the old one. Staff scan resolves the
   *person*, then the backend checks that person's booking for today.

**Consequence for Gift a Seat:** since checking in requires the account's
own QR, whoever will physically attend needs an account — the backend's
line *"book for themselves or another existing or newly invited user"*
(§4.1, §5.1) now reads as consistent with this, not a separate question.
Gifting means selecting an existing platform user or sending an account
invite, not entering a free-text guest name with no account.

✅ **Applied:** `LandingPage.jsx`'s Gift-a-Seat copy corrected (previously
said "no account needed on their end," which contradicted this). No other
code changes needed — `HowItWorksPage.jsx` and the rest of `LandingPage.jsx`
already described per-user QR correctly (written before your per-booking
correction reached me, and never actually reverted — this decision brings
the doc back in line with code that was already right).

## 4. Wallet — ✅ resolved (final): following the backend, cash funding included

Same pattern as QR: an earlier decision here ("no cash payment") is now
superseded in favor of what the backend actually sent, since their
Testing/Deployment/Maintenance Guide reconfirmed cash funding as a frozen,
approved, launch-required feature (§24: *"☐ Cash funding works"*), on top
of their first spec's *"Super Admin may credit wallets for authorized cash
payments"* (§5.4).

**Final wallet rules, matching the backend exactly:**
- Every user has exactly one wallet.
- Bookings are paid by debiting the wallet — no other payment method at
  checkout.
- Money enters the wallet two ways: Paystack online funding, or a Super
  Admin cash-funding credit for an authorized in-person payment.
- Unused balance simply sits in the wallet indefinitely — no requirement
  to spend it down.
- The wallet balance never expires.

✅ **Already implemented, nothing to revert:** the cash-funding feature
(`WalletContext.creditUserWallet`, the "Credit Wallet" action in
`AdminClientsPage`, `CASH_FUNDING` in `constants.js`/`walletService.js`)
was built in an earlier session and never actually removed (development
paused before that cleanup happened) — so it's already sitting there
correctly, no work needed.

## 5. Cancellation vs. reassignment — ✅ resolved, no change from last session

Frontend previously had a **48-hour reschedule rule that doesn't exist in
the backend spec at all.** Real rules, already implemented:
- **Cancel** any future, unused date, any time (no minimum notice) → wallet
  credit, never cash.
- **Reassign** a future date to a different date, capped at 3 operations
  per calendar month, atomic (all requested dates succeed or none do).

Implemented: `constants.js` (`BOOKING_STATUS`), copy fixes across
`ClientDashboardPage`, `HowItWorksPage`, nav labels ("Reassignment
Requests").

## 6. Verification — ✅ resolved

Backend requires four states (`UNVERIFIED`/`PENDING`/`VERIFIED`/`REJECTED`),
fed by a profile-photo + ID-document submission that gets reviewed — not a
single tap-to-approve action at the QR scanner.

Implemented: `constants.js` (`VERIFICATION_STATUS`, `STATUS_STYLES`),
copy fixes in `RegisterPage`, `ClientDashboardPage`.

## 7. Booking granularity — ⚪ still open, not yet built

Backend supports **continuous** (every business day in a period) and
**flexible** (hand-picked business days) bookings, a configurable max
window (default 30 days), and branch-specific operating days. This will
shape the Phase 3 booking UI once it's designed — noted here so it isn't
built against the wrong model. No code impact yet since Booking doesn't
exist.

---

## 8. Not yet reflected anywhere (flagged for later)

- Reassignment monthly-limit tracking, atomic multi-date availability
  checks — booking logic, doesn't exist until Phase 3.
- Identity verification submission UI (photo + ID document upload) —
  Phase 5, not yet built.
- Two-factor authentication — optional per spec, not yet scheduled.

## 9. New document: Testing, Deployment & Maintenance Guide (Doc 7 of 7)

This is their **frozen, approved** final backend document (their Section
30 explicitly says the 7-document set is complete and future changes are
controlled change requests, not new docs). It doesn't define new business
rules — it's testing/deployment/ops — but its test-case wording and
checklists confirm several concrete details we didn't have before, and its
evidence tipped two earlier decisions.

### ✅ Resolved by following the backend (see §3 and §4 above for full detail)

**Cash funding** — kept, following their frozen doc's pre-launch checklist
(*"☐ Cash funding works"*). No code change needed; it was already built
and never removed.

**QR model** — settled as per-user, following their test cases ("QR
belonging to another user", "QR without a booking"). `LandingPage.jsx`'s
Gift-a-Seat copy corrected to match; everything else already described it
this way.

### ✅ New confirmed details — applied

- **Exact endpoint contracts** (§2): `/api/v1/auth/login`, `/api/v1/wallet/fund`,
  `/api/v1/availability` (GET), `/api/v1/bookings` (+`/:id/cancel`,
  `/:id/reassign`), `/api/v1/qr/verify`, `/api/v1/checkins`, `/api/v1/health`.
  `api.js` now defaults to the `/api/v1` base; `walletService.js` fixed to
  call `/wallet/fund`; new stub `bookingService.js`, `qrService.js`,
  `checkinService.js` created with these exact paths for whoever builds
  those phases next.
- **Response envelope** (§13/§23): `{ success, message, data }` on success,
  `{ success, message, code }` on error. `api.js` rewritten to unwrap
  `data.data` automatically and attach `.code` to thrown errors, so future
  service code can branch on documented error codes
  (`INSUFFICIENT_BALANCE`, `SEAT_UNAVAILABLE`, `BOOKING_CONFLICT`,
  `REASSIGNMENT_LIMIT_REACHED`, `QR_REVOKED`, etc.) instead of matching
  message text.
- **Branches have operating hours, a timezone, and operating days** (§9,
  §24) — not just "operating days" as previously noted. `CatalogContext`,
  `BranchFormModal`, `AdminBranchesPage`, and the public `BranchesPage` all
  updated with `openTime`/`closeTime`/`timezone`/`operatingDays`.
- **Booking dates have their own status, independent of the booking as a
  whole** (§3's diagram — one booking can have dates simultaneously
  `COMPLETED`, `ACTIVE`, and `CANCELLED`). Added `BOOKING_DATE_STATUS` to
  `constants.js`, separate from the whole-booking `BOOKING_STATUS`.

### 📝 Design principle for later (no code impact yet)

- *"Availability shown to the frontend must never be treated as the final
  authority"* (§6) — the Booking UI (Phase 3, not yet built) must handle a
  booking attempt failing on an apparently-available seat, since the
  backend only finalizes availability at booking time, not at browse time.

### ⚪ Still don't have

This document is testing/deployment/ops only. The functional spec,
database schema, Prisma schema, API specification, and service-layer
architecture are Documents 1–6 in their set and haven't been shared yet —
those are what would let us build Booking (Phase 3) with confidence rather
than best-guessing the contract. Recommend holding off on that phase until
at least the API spec and Prisma schema documents are available.

