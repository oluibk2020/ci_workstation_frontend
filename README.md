# Work Station — Frontend

React + Vite + Tailwind CSS frontend for Work Station, scaffolded from
`Work Station — Frontend Product & Architecture Documentation` (Revision 3).

## What's built (Phase 1 — Foundation)

Per the doc's Recommended Development Order (Section 26), this covers steps 1–8:

- Project setup (Vite + React + Tailwind v4)
- Design system (color tokens from Section 19, Inter + JetBrains Mono type pairing)
- Main layouts: `PublicLayout`, `AuthLayout`, `DashboardLayout`
- Navbar, Footer, Sidebar (role-driven nav from Sections 7/11/14), Topbar
- Authentication UI: Login, Register, Forgot/Reset Password (mocked — see below)
- Protected routes with role-based guarding (`ProtectedRoute.jsx`)
- Client dashboard (Section 7 wireframe)
- Public site: Landing, About, Workstations, Locations, Pricing, How It Works, Contact
- Manager dashboard (Section 11 wireframe)
- Admin dashboard (Section 14 wireframe)

Routes for later phases (booking, QR scanning, approvals, reports, etc.) are
wired up and reachable from each sidebar, but render a `ComingSoon`
placeholder labeled with the MVP phase that will build them out — see
`src/App.jsx`.

## Mocked authentication

There's no backend yet, so `AuthContext` fakes login/register against
`localStorage`. To preview each dashboard without a real backend:

- Any email/password → **Client** (starts `UNVERIFIED`)
- `manager@anything` → **Manager**
- `admin@anything` → **Admin**

Swap the bodies of `login`/`register`/`logout` in
`src/context/AuthContext.jsx` for real calls to `src/services/authService.js`
once the Express/Prisma auth endpoints exist. The shape returned to the rest
of the app (`user`, `role`, `verificationStatus`) is designed to stay the
same so nothing downstream needs to change.

## Running it

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and point `VITE_API_BASE_URL` at your backend
when it's ready.

## Folder structure

Matches Section 4 of the documentation:

```
src/
├── components/{common,layout,client,manager,admin,booking,workstation,location,qr,approval,charts}/
├── pages/{public,auth,client,manager,admin}/
├── context/        (AuthContext — BookingContext/NotificationContext to follow in later phases)
├── hooks/
├── services/       (api.js, authService.js — bookingService/locationService etc. to follow)
├── utils/          (constants.js, navConfig.js, roleRouting.js)
└── routes/         (ProtectedRoute.jsx)
```

## Next steps (Phase 2 onward)

1. **Locations** (Admin-only creation, per-location pricing) — Section 18 `Location` entity
2. **Workstation pages** — full CRUD screens for Admin, live catalog wired to real data
3. **Booking interface** — date-range picker, Gift a Seat flow, 48-hour reschedule rule
4. **Hour wallet** — subscription purchase, per-day deduction using `dailyHourValue`
5. **QR pass + scanner** — including the unverified-client approval step
6. **Session management**, **Admin reports**, then **real-time** (Socket.IO) last

See Section 25 (MVP Development Phases) and Section 26 (Recommended
Development Order) in the documentation for the full sequence.
