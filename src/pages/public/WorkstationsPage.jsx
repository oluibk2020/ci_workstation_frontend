import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import Eyebrow from "../../components/common/Eyebrow";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { useCatalog } from "../../context/CatalogContext";
import { SEAT_STATUS } from "../../utils/constants";

export default function WorkstationsPage() {
  const { seatsWithDetails, seatsRequireAuth, workstations } = useCatalog();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <Eyebrow>Workstation catalog</Eyebrow>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
        Browse seats by branch
      </h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        Every listing is a specific seat at a branch — bring your own laptop or computer to use
        there.
      </p>

      {seatsRequireAuth ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-16 text-center">
          <LogIn size={28} className="text-slate-300" />
          <div>
            <p className="font-semibold text-[var(--color-primary)]">Log in to see live seat availability</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Workstation types and pricing are public, but individual seat status requires an
              account.
            </p>
          </div>
          <div className="flex gap-3">
            <Button as={Link} to="/login" variant="outline" size="sm">
              Log in
            </Button>
            <Button as={Link} to="/register" size="sm">
              Create an account
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {seatsWithDetails.map((seat) => (
            <div key={seat.id} className="flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Seat {seat.seatId} · {seat.branchName}
                </p>
                <Badge status={seat.status} />
              </div>
              <p className="mt-3 text-lg font-semibold text-[var(--color-primary)]">{seat.workstationName}</p>
              <div className="mt-5 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
                <p className="font-mono-tight text-lg font-bold text-[var(--color-primary)]">
                  ₦{seat.pricePerDay.toLocaleString()}/day
                </p>
                <Button as={Link} to="/register" size="sm" disabled={seat.status !== SEAT_STATUS.ACTIVE}>
                  Book now
                </Button>
              </div>
            </div>
          ))}
          {seatsWithDetails.length === 0 && workstations.length > 0 && (
            <p className="col-span-full text-sm text-slate-400">No seats have been added yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
