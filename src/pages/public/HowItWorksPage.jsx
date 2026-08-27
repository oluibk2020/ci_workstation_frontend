import Eyebrow from "../../components/common/Eyebrow";

const STEPS = [
  { n: "01", title: "Create an account", desc: "Sign up in a couple of minutes. New accounts start unverified — submit a profile photo and ID document before your first visit, since first-time physical access requires verification to be complete first." },
  { n: "02", title: "Fund your wallet", desc: "Top up online via Paystack anytime — no minimum, no plan, and the balance never expires. Every booking is paid from this balance; there's no separate card payment at checkout." },
  { n: "03", title: "Book a workstation", desc: "Pick a branch and seat, then choose your days — a continuous run of business days, or specific days within a period. Book it for yourself, or for another existing (or newly invited) user." },
  { n: "04", title: "Your wallet is debited", desc: "One flat rate per day, times the number of days booked — no discount for booking more, and no other payment method at this step." },
  { n: "05", title: "Get your QR pass", desc: "Each account has one persistent personal QR — it's not generated per booking. If you booked for someone else, they check in with their own QR, which the backend matches against your booking for that day." },
  { n: "06", title: "Arrive and check in", desc: "Staff scan your QR, the backend checks your account, verification status, and today's booking, then staff explicitly triggers check-in." },
  { n: "07", title: "Work your session", desc: "Bring your own laptop, plug in, and get online. You're automatically checked out at the branch's closing time." },
  { n: "08", title: "Need to change your dates?", desc: "Cancel any future, unused date anytime — you won't get cash back, but the value is credited to your wallet for a future booking. To move a date instead of cancelling it, use Reassign (up to 3 times a month)." },
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
