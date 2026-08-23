import Eyebrow from "../../components/common/Eyebrow";

const STEPS = [
  { n: "01", title: "Create an account", desc: "Sign up in a couple of minutes. New accounts start as unverified — a manager or admin approves you the first time you check in." },
  { n: "02", title: "Book a workstation", desc: "Pick a location and desk, then choose a single day, several days, or an open date range. You can book it for yourself or gift it to someone else." },
  { n: "03", title: "Pay for your days", desc: "One flat rate per day at checkout — no subscription, no bundle, no discount for booking more days." },
  { n: "04", title: "Get your QR pass", desc: "It's generated instantly. If you gifted the seat, the person you booked it for gets a pass that works just the same." },
  { n: "05", title: "Arrive and check in", desc: "A manager scans your QR code. First-time unverified clients are approved on the spot before the session starts." },
  { n: "06", title: "Work your session", desc: "Bring your own laptop, plug in, and get online. Sessions are tracked by the backend, not a browser timer." },
  { n: "07", title: "Need to change your dates?", desc: "Bookings can't be cancelled, but you can reschedule — as long as it's more than 48 hours before your booking starts." },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <Eyebrow>How it works</Eyebrow>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
        From sign-up to session, step by step
      </h1>

      <ol className="mt-12 space-y-10">
        {STEPS.map((step) => (
          <li key={step.n} className="flex gap-6">
            <span className="font-mono-tight text-2xl font-bold text-slate-200">{step.n}</span>
            <div>
              <h3 className="font-semibold text-[var(--color-primary)]">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
