import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Eyebrow from "../../components/common/Eyebrow";
import Button from "../../components/common/Button";
import { useCatalog } from "../../context/CatalogContext";

const POINTS = [
  "Pay for exactly the days you book — nothing loaded in advance.",
  "The rate per day never changes based on volume. Book 1 day or 30, it's the same daily rate.",
  "No subscriptions, no expiring bundles, no unused balance to keep track of.",
  "Gifting a seat costs the same as booking it for yourself — the booker pays at checkout.",
];

export default function PricingPage() {
  const { workstations, getLocationName } = useCatalog();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
          One flat rate per day. No bundles, no discounts.
        </h1>
        <p className="mt-3 text-slate-500">
          Every workstation has a daily rate, set by location. You pay for exactly the number of
          days you book — the per-day price doesn't drop for booking more days.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-[var(--color-line)] bg-white p-6 sm:p-8">
        <ul className="space-y-3">
          {POINTS.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-slate-600">
              <Check size={18} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Sample daily rates</h2>
        <p className="mt-1 text-sm text-slate-500">
          Final rates are configured per location and workstation by our admin team.
        </p>
        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Desk type</th>
                <th className="px-5 py-3 text-right">Rate / day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {workstations.map((ws) => (
                <tr key={ws.id}>
                  <td className="px-5 py-3 font-medium text-[var(--color-primary)]">{getLocationName(ws.locationId)}</td>
                  <td className="px-5 py-3 text-slate-500">{ws.deskType}</td>
                  <td className="px-5 py-3 text-right font-mono-tight font-semibold text-[var(--color-primary)]">
                    ₦{ws.dailyRate.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          <span className="font-mono-tight font-semibold text-[var(--color-primary)]">Example:</span>{" "}
          booking a Standing Desk in Sagamu for 5 days costs 5 × ₦8,000 = ₦40,000 — the same ₦8,000/day
          rate whether you book 1 day or 20.
        </div>

        <div className="mt-8 flex justify-center">
          <Button as={Link} to="/register" size="lg">
            Create your account
          </Button>
        </div>
      </div>
    </div>
  );
}
