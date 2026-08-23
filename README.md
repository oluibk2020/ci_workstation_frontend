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

**Final login/role system is pending confirmation from the backend team.**
Everything below is a temporary stand-in so the frontend can be built and
demoed in the meantime — see `src/context/UsersContext.jsx` for the full
rationale.

There's no backend yet, so `AuthContext` fakes login/register against a
mock account directory (`UsersContext`) + `localStorage`. Key rule: **the
public login/register flow can only ever produce a Client account.** There
is no role picker and no email-prefix trick. The only way a Manager account
exists is an Admin promoting a Client via **Admin → Clients → Make
Manager**.

To preview each dashboard without a real backend:

- Register a new account (or log in as `john@demo.com` — any password) to
  see the Client experience.
- To see the Admin dashboard during development, log in as
  `admin@charis.dev` (any password) — this is a seeded bootstrap account,
  not something surfaced anywhere in the product UI. Once logged in as
  Admin, go to **Clients** and promote any Client to Manager to preview
  that dashboard too.

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
