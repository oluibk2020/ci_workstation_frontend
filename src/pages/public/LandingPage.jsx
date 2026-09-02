import { Link } from "react-router-dom";
import {
  Zap,
  Wifi,
  CalendarDays,
  QrCode,
  Gift,
  MapPin,
  ArrowRight,
  Quote,
} from "lucide-react";
import Button from "../../components/common/Button";
import Eyebrow from "../../components/common/Eyebrow";
import StatusStrip from "../../components/common/StatusStrip";
import { useCatalog } from "../../context/CatalogContext";

const FEATURES = [
  {
    icon: Zap,
    title: "Power that doesn't flinch",
    desc: "UPS-backed outlets at every desk. Bring your laptop — the socket is the part we guarantee.",
  },
  {
    icon: Wifi,
    title: "Dedicated internet, not shared chaos",
    desc: "A fixed bandwidth allocation per seat, so someone else's video call never eats your upload speed.",
  },
  {
    icon: CalendarDays,
    title: "Book by the day, not the hour",
    desc: "Reserve one day, a whole week, or an open-ended range. No clock-watching mid-session.",
  },
  {
    icon: QrCode,
    title: "Walk in with a QR code",
    desc: "Your pass is generated the moment you book. Show it at the desk — verification takes seconds.",
  },
  {
    icon: Gift,
    title: "Gift a seat",
    desc: "Book a desk for a teammate or friend. They check in with their own account and QR — invite them in seconds if they're not on Work Station yet.",
  },
  {
    icon: MapPin,
    title: "Pricing set per branch",
    desc: "Sagamu, Lekki, or wherever we open next — each branch is priced for what it actually costs to run.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Fund your wallet",
    desc: "Top up via Paystack anytime — no minimum, and it never expires.",
  },
  {
    n: "02",
    title: "Book a desk",
    desc: "Pick a branch, a workstation type, and one or more days.",
  },
  {
    n: "03",
    title: "Get your QR pass",
    desc: "One persistent QR per account — for you, or whoever you're gifting the seat to.",
  },
  {
    n: "04",
    title: "Check in and work",
    desc: "Staff verify your QR on arrival and your session starts.",
  },
];

const TESTIMONIAL = {
  quote:
    "I stopped losing afternoons to NEPA. Now I just check the status strip before I leave the house.",
  name: "Chidinma A.",
  role: "Backend developer, Lagos",
};

export default function LandingPage() {
  const { seatsWithDetails } = useCatalog();
  const showcaseWorkstations = seatsWithDetails.slice(0, 3);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-[var(--color-primary)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Bring your laptop. We handle the rest.</Eyebrow>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Your coding space.
              <br />
              Your time. Your workstation.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
              Work Station gives developers a reliable desk, real internet, and
              a door that locks. Book by the day, show up with your own machine,
              and get to work.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button as={Link} to="/register" size="lg">
                Book a workstation
                <ArrowRight size={18} />
              </Button>
              <Button
                as={Link}
                to="/how-it-works"
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:border-white hover:text-white hover:bg-white/5"
              >
                See how it works
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-3xl">
            <StatusStrip />
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="max-w-2xl">
          <Eyebrow>Why developers pick Work Station</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
            Everything except the laptop.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[var(--color-line)] bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-slate-200/60"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <f.icon size={22} />
              </div>
              <h3 className="mt-4 font-semibold text-[var(--color-primary)]">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <Eyebrow>The process</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
              Four steps, in order, every time.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <p className="font-mono-tight text-4xl font-bold text-slate-200">
                  {s.n}
                </p>
                <h3 className="mt-3 font-semibold text-[var(--color-primary)]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {s.desc}
                </p>
                {i < STEPS.length - 1 && (
                  <div className="absolute right-[-1rem] top-4 hidden text-slate-300 lg:block">
                    <ArrowRight size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- WORKSTATION SHOWCASE ---------- */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <Eyebrow>Workstation showcase</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
              A desk, a socket, a signal.
            </h2>
          </div>
          <Link
            to="/workstations"
            className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
          >
            View all workstations →
          </Link>
        </div>

        <img
          src="/photos/sagamu-desks.jpg"
          alt="Partitioned desks with privacy dividers at the Sagamu branch"
          className="mx-auto mt-8 aspect-[4/3] w-full max-w-3xl rounded-2xl object-cover sm:aspect-[16/9] sm:max-w-none"
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {showcaseWorkstations.map((ws) => (
            <div
              key={ws.id}
              className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white"
            >
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 font-mono-tight text-sm text-slate-400">
                Seat {ws.seatId}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Seat {ws.seatId} · {ws.branchName}
                  </p>
                  <span className="h-2 w-2 rounded-full bg-[var(--color-success)] status-dot" />
                </div>
                <p className="mt-2 font-semibold text-[var(--color-primary)]">
                  {ws.workstationName}
                </p>
                <p className="mt-4 font-mono-tight text-lg font-bold text-[var(--color-primary)]">
                  ₦{ws.pricePerDay.toLocaleString()}/day
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- PRICING PREVIEW ---------- */}
      <section className="bg-[var(--color-primary)] py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            One flat rate per day. No bundles, no discounts.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Every workstation type has a daily rate, set per branch. Pay for
            exactly the days you book, straight from your wallet — the rate per
            day doesn't drop whether you book 1 day or 30.
          </p>

          <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
            {showcaseWorkstations.map((ws) => (
              <div
                key={ws.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {ws.branchName}
                </p>
                <p className="mt-2 font-mono-tight text-2xl font-bold text-white">
                  ₦{ws.pricePerDay.toLocaleString()}/day
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {ws.workstationName}
                </p>
              </div>
            ))}
          </div>

          <Button
            as={Link}
            to="/pricing"
            variant="outline"
            className="mt-10 border-white/20 text-white hover:border-white hover:bg-white/5 hover:text-white"
          >
            See all rates
          </Button>
        </div>
      </section>

      {/* ---------- TESTIMONIAL ---------- */}
      <section className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
        <Quote className="mx-auto text-[var(--color-accent)]" size={32} />
        <p className="mt-6 text-center text-2xl font-medium leading-snug text-[var(--color-primary)] sm:text-3xl">
          "{TESTIMONIAL.quote}"
        </p>
        <p className="mt-6 text-center text-sm text-slate-500">
          <span className="font-semibold text-[var(--color-primary)]">
            {TESTIMONIAL.name}
          </span>{" "}
          — {TESTIMONIAL.role}
        </p>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="border-t border-[var(--color-line)] bg-white py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
            Your next desk is a booking away.
          </h2>
          <Button as={Link} to="/register" size="lg">
            Create your account
            <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </>
  );
}
