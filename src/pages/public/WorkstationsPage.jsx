import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { LogIn, Loader2 } from "lucide-react";
import Eyebrow from "../../components/common/Eyebrow";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { useCatalog } from "../../context/CatalogContext";
import { SEAT_STATUS } from "../../utils/constants";
import { bookingService } from "../../services/bookingService";
import { todayISO } from "../../utils/businessDate";

/**
 * "user should see all available workstations and booked workstations
 * [before booking]" — this page now shows real, live availability for
 * today (computed from the same /availability endpoint the booking flow
 * itself uses), not just a seat's own ACTIVE/INACTIVE enabled-state.
 *
 * Explicitly filters to ACTIVE seats only, regardless of viewer role —
 * CatalogContext now returns every status (including INACTIVE) when the
 * viewer is Super Admin, which is correct for Admin management pages but
 * would be wrong here: an admin browsing this public catalog while logged
 * in should see exactly what a client sees, nothing extra.
 */
export default function WorkstationsPage() {
  const { seatsWithDetails, seatsRequireAuth, workstations, branches } = useCatalog();
  const [todaysAvailability, setTodaysAvailability] = useState({}); // seatId -> "AVAILABLE" | "BOOKED"
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const activeSeats = useMemo(
    () => seatsWithDetails.filter((seat) => seat.status === SEAT_STATUS.ACTIVE),
    [seatsWithDetails]
  );

  useEffect(() => {
    if (activeSeats.length === 0) return;

    const workstationPairs = [
      ...new Map(activeSeats.map((s) => [s.workstationId, { workstationId: s.workstationId, branchId: s.branchId }])).values(),
    ];

    let cancelled = false;
    setLoadingAvailability(true);

    const today = todayISO();

    Promise.all(
      workstationPairs.map(({ branchId, workstationId }) =>
        bookingService
          .getAvailability({ branchId, workstationId, startDate: today, endDate: today })
          .then((result) => result.dates?.[0]?.seats || [])
          .catch(() => [])
      )
    ).then((results) => {
      if (cancelled) return;
      const map = {};
      results.flat().forEach((s) => {
        map[s.id] = s.availability;
      });
      setTodaysAvailability(map);
      setLoadingAvailability(false);
    });

    return () => {
      cancelled = true;
    };
  }, [activeSeats]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <Eyebrow>Workstation catalog</Eyebrow>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
        Browse seats by branch
      </h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        Every listing is a specific seat at a branch — bring your own laptop or computer to use
        there. Availability shown is for today; booking lets you pick any date.
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
          {activeSeats.map((seat) => {
            const availability = todaysAvailability[seat.id];
            return (
              <div key={seat.id} className="flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Seat {seat.seatId} · {seat.branchName}
                  </p>
                  {loadingAvailability && !availability ? (
                    <Loader2 size={14} className="animate-spin text-slate-300" />
                  ) : (
                    <Badge status={availability === "BOOKED" ? "BOOKED_TODAY" : "AVAILABLE_TODAY"}>
                      {availability === "BOOKED" ? "Booked today" : "Available today"}
                    </Badge>
                  )}
                </div>
                <p className="mt-3 text-lg font-semibold text-[var(--color-primary)]">{seat.workstationName}</p>
                <div className="mt-5 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
                  <p className="font-mono-tight text-lg font-bold text-[var(--color-primary)]">
                    ₦{seat.pricePerDay.toLocaleString()}/day
                  </p>
                  <Button as={Link} to="/register" size="sm">
                    Book now
                  </Button>
                </div>
              </div>
            );
          })}
          {activeSeats.length === 0 && workstations.length > 0 && (
            <p className="col-span-full text-sm text-slate-400">No seats have been added yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
