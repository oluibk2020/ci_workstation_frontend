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
│   ├── client/ manager/ admin/ booking/ qr/ approval/ charts/   (empty — future phases)
├── pages/
│   ├── public/          Landing, About, Workstations, Locations, Pricing, HowItWorks, Contact
│   ├── auth/             Login, Register, ForgotPassword, ResetPassword
│   ├── client/           ClientDashboardPage
│   ├── manager/          ManagerDashboardPage, ManagerWorkstationsPage
│   └── admin/            AdminDashboardPage, AdminLocationsPage, AdminWorkstationsPage
├── context/              AuthContext.jsx, CatalogContext.jsx
├── services/             api.js, authService.js, locationService.js, workstationService.js
├── utils/                constants.js, navConfig.js, roleRouting.js
└── routes/               ProtectedRoute.jsx
```

## Build Log

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

- **Auth** — `AuthContext` fakes login/register against `localStorage`.
  `manager@…` → Manager, `admin@…` → Admin, anything else → Client.
- **Dashboard numbers** — amounts spent, booking counts, revenue, etc. are
  hardcoded sample data in each dashboard page.
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
