import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, X, ArrowRight } from "lucide-react";
import { useCatalog } from "../../context/CatalogContext";
import { useWallet } from "../../context/WalletContext";
import { bookingService } from "../../services/bookingService";
import { publicUserService } from "../../services/publicUserService";
import { getOperatingDates, isOperatingDay, todayISO, addDaysISO, formatDateLabel } from "../../utils/businessDate";
import Button from "../../components/common/Button";

const MAX_ADVANCE_DAYS = 30; // mirrors backend's MAX_ADVANCE_BOOKING_DAYS
const MAX_BOOKING_DAYS = 30; // mirrors backend's MAX_BOOKING_DAYS

export default function BookWorkstationPage() {
  const navigate = useNavigate();
  const { branches, getWorkstationsForBranch, getBranchName } = useCatalog();
  const { balance } = useWallet();

  // ---------- Branch / workstation ----------
  const [branchId, setBranchId] = useState("");
  const [workstationId, setWorkstationId] = useState("");
  const activeBranches = branches.filter((b) => b.status === "ACTIVE" || !b.status);
  const workstationOptions = branchId ? getWorkstationsForBranch(branchId).filter((wk) => wk.status !== "INACTIVE") : [];
  const branch = branches.find((b) => b.id === branchId);
  const workstation = workstationOptions.find((wk) => wk.id === workstationId);

  function resetDatesAndAvailability() {
    setStartDate("");
    setEndDate("");
    setFlexDates([]);
    setAvailability(null);
    setSelectedSeatId("");
  }

  function handleBranchChange(id) {
    setBranchId(id);
    setWorkstationId("");
    resetDatesAndAvailability();
  }

  function handleWorkstationChange(id) {
    setWorkstationId(id);
    resetDatesAndAvailability();
  }

  // ---------- Booking for self or someone else ----------
  const [bookingFor, setBookingFor] = useState("SELF");
  const [beneficiaryEmail, setBeneficiaryEmail] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [emailCheck, setEmailCheck] = useState(null); // { exists, name } | null
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailCheckError, setEmailCheckError] = useState("");

  async function handleCheckEmail() {
    if (!beneficiaryEmail.trim()) return;
    setEmailChecking(true);
    setEmailCheckError("");
    setEmailCheck(null);
    try {
      const result = await publicUserService.checkEmail(beneficiaryEmail.trim());
      setEmailCheck(result);
    } catch (err) {
      setEmailCheckError(err.message || "Couldn't check this email right now.");
    } finally {
      setEmailChecking(false);
    }
  }

  // ---------- Dates ----------
  const [bookingType, setBookingType] = useState("CONTINUOUS"); // CONTINUOUS | FLEXIBLE
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flexInput, setFlexInput] = useState("");
  const [flexDates, setFlexDates] = useState([]);

  const minDate = todayISO();
  const maxDate = addDaysISO(todayISO(), MAX_ADVANCE_DAYS);

  function addFlexDate() {
    if (!flexInput) return;
    if (flexDates.includes(flexInput)) {
      setFlexInput("");
      return;
    }
    setFlexDates([...flexDates, flexInput].sort());
    setFlexInput("");
    setAvailability(null);
    setSelectedSeatId("");
  }

  function removeFlexDate(date) {
    setFlexDates(flexDates.filter((d) => d !== date));
    setAvailability(null);
    setSelectedSeatId("");
  }

  // The dates actually being requested, regardless of mode.
  const requestedDates = useMemo(() => {
    if (!branch) return [];
    if (bookingType === "CONTINUOUS") {
      if (!startDate || !endDate || startDate > endDate) return [];
      return getOperatingDates({ startDate, endDate, operatingDays: branch.operatingDays || [] });
    }
    return flexDates.filter((d) => isOperatingDay(d, branch.operatingDays || []));
  }, [bookingType, startDate, endDate, flexDates, branch]);

  const nonOperatingFlexDates = useMemo(() => {
    if (!branch || bookingType !== "FLEXIBLE") return [];
    return flexDates.filter((d) => !isOperatingDay(d, branch.operatingDays || []));
  }, [bookingType, flexDates, branch]);

  const exceedsMaxDays = requestedDates.length > MAX_BOOKING_DAYS;

  // ---------- Availability ----------
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [selectedSeatId, setSelectedSeatId] = useState("");

  async function handleCheckAvailability() {
    if (requestedDates.length === 0) return;
    setAvailabilityLoading(true);
    setAvailabilityError("");
    setAvailability(null);
    setSelectedSeatId("");
    try {
      const boundStart = requestedDates[0];
      const boundEnd = requestedDates[requestedDates.length - 1];
      const result = await bookingService.getAvailability({
        branchId,
        workstationId,
        startDate: boundStart,
        endDate: boundEnd,
      });
      setAvailability(result);
    } catch (err) {
      setAvailabilityError(err.message || "Couldn't check availability right now.");
    } finally {
      setAvailabilityLoading(false);
    }
  }

  // Seats that are AVAILABLE on every single requested date — the only
  // seats that can actually fulfil this whole booking.
  const availableSeats = useMemo(() => {
    if (!availability) return [];
    const relevantDates = availability.dates.filter((d) => requestedDates.includes(d.date));
    if (relevantDates.length !== requestedDates.length) return []; // some requested date wasn't returned at all

    const bySeat = new Map();
    for (const dateEntry of relevantDates) {
      for (const seat of dateEntry.seats) {
        if (!bySeat.has(seat.id)) bySeat.set(seat.id, { ...seat, availableOnAll: true });
        if (seat.availability !== "AVAILABLE") bySeat.get(seat.id).availableOnAll = false;
      }
    }
    return Array.from(bySeat.values()).filter((s) => s.availableOnAll);
  }, [availability, requestedDates]);

  // ---------- Price ----------
  const totalPrice = workstation ? requestedDates.length * Number(workstation.pricePerDay) : 0;
  const canAffordBooking = balance >= totalPrice;

  // ---------- Submit ----------
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(null);

  const canSubmit =
    branchId &&
    workstationId &&
    selectedSeatId &&
    requestedDates.length > 0 &&
    !exceedsMaxDays &&
    (bookingFor === "SELF" || (beneficiaryEmail && emailCheck && (emailCheck.exists || beneficiaryName.trim())));

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        bookingFor,
        branchId,
        workstationId,
        seatId: selectedSeatId,
        type: bookingType,
        ...(bookingFor === "OTHER" && {
          beneficiaryEmail: beneficiaryEmail.trim(),
          ...(!emailCheck?.exists && {
            createBeneficiaryAccount: true,
            beneficiaryName: beneficiaryName.trim(),
          }),
        }),
        ...(bookingType === "CONTINUOUS" ? { startDate, endDate } : { dates: requestedDates }),
      };

      const result = await bookingService.create(payload);
      setSuccess(result);
    } catch (err) {
      setSubmitError(err.message || "Couldn't complete this booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- Success screen ----------
  if (success) {
    return (
      <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-[var(--color-line)] bg-white p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-[var(--color-success)]" />
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Booking confirmed</h1>
          <p className="mt-2 text-sm text-slate-500">
            {requestedDates.length} day{requestedDates.length === 1 ? "" : "s"} at {workstation?.name},{" "}
            {getBranchName(branchId)} — ₦{totalPrice.toLocaleString()} debited from your wallet.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Book another
          </Button>
          <Button onClick={() => navigate("/client/bookings")}>
            View my bookings
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Book a Workstation</h1>
        <p className="text-sm text-slate-500">
          Pricing is a flat rate per day — no discount for booking more days. Your wallet is debited
          immediately when the booking is confirmed.
        </p>
      </div>

      {/* ---------- Branch & workstation ---------- */}
      <section className="space-y-4 rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">1. Where</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Branch</label>
            <select
              value={branchId}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            >
              <option value="">Select a branch</option>
              {activeBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Workstation type</label>
            <select
              value={workstationId}
              onChange={(e) => handleWorkstationChange(e.target.value)}
              disabled={!branchId}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none disabled:bg-slate-50"
            >
              <option value="">Select a type</option>
              {workstationOptions.map((wk) => (
                <option key={wk.id} value={wk.id}>
                  {wk.name} — ₦{Number(wk.pricePerDay).toLocaleString()}/day
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ---------- Self or gift ---------- */}
      <section className="space-y-4 rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">2. Who's it for</p>
        <div className="flex gap-2">
          {["SELF", "OTHER"].map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setBookingFor(opt);
                setEmailCheck(null);
              }}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                bookingFor === opt
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--color-line)] text-slate-500 hover:border-slate-300"
              }`}
            >
              {opt === "SELF" ? "Myself" : "Gift a seat"}
            </button>
          ))}
        </div>

        {bookingFor === "OTHER" && (
          <div className="space-y-3 border-t border-[var(--color-line)] pt-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Recipient's email</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="email"
                  value={beneficiaryEmail}
                  onChange={(e) => {
                    setBeneficiaryEmail(e.target.value);
                    setEmailCheck(null);
                  }}
                  className="w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                  placeholder="them@example.com"
                />
                <Button variant="outline" size="sm" onClick={handleCheckEmail} disabled={emailChecking || !beneficiaryEmail.trim()}>
                  {emailChecking ? <Loader2 size={14} className="animate-spin" /> : "Check"}
                </Button>
              </div>
            </div>

            {emailCheckError && <p className="text-sm text-[var(--color-danger)]">{emailCheckError}</p>}

            {emailCheck?.exists && (
              <p className="flex items-center gap-1.5 text-sm text-[var(--color-success)]">
                <CheckCircle2 size={16} />
                {emailCheck.name} already has an account — they'll be booked directly.
              </p>
            )}

            {emailCheck && !emailCheck.exists && (
              <div className="space-y-3">
                <p className="flex items-center gap-1.5 text-sm text-amber-700">
                  <XCircle size={16} />
                  No account found for this email. We'll create one and invite them.
                </p>
                <div>
                  <label className="text-sm font-medium text-slate-700">Their name</label>
                  <input
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                    placeholder="Ada Obi"
                  />
                </div>
                <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                  They'll get an email with their booking details and instructions to sign in with
                  Google using this email address.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ---------- Dates ---------- */}
      <section className="space-y-4 rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">3. Which days</p>
        <div className="flex gap-2">
          {["CONTINUOUS", "FLEXIBLE"].map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setBookingType(opt);
                resetDatesAndAvailability();
              }}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                bookingType === opt
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--color-line)] text-slate-500 hover:border-slate-300"
              }`}
            >
              {opt === "CONTINUOUS" ? "A date range" : "Specific days"}
            </button>
          ))}
        </div>

        {bookingType === "CONTINUOUS" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">From</label>
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setAvailability(null);
                  setSelectedSeatId("");
                }}
                className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">To</label>
              <input
                type="date"
                min={startDate || minDate}
                max={maxDate}
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setAvailability(null);
                  setSelectedSeatId("");
                }}
                className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={flexInput}
                onChange={(e) => setFlexInput(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              />
              <Button variant="outline" size="sm" onClick={addFlexDate} disabled={!flexInput}>
                Add
              </Button>
            </div>
            {flexDates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {flexDates.map((d) => (
                  <span
                    key={d}
                    className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {formatDateLabel(d)}
                    <button onClick={() => removeFlexDate(d)} aria-label={`Remove ${d}`}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {branch && requestedDates.length > 0 && (
          <p className="text-sm text-slate-500">
            {requestedDates.length} operating day{requestedDates.length === 1 ? "" : "s"} at {branch.name}
            {nonOperatingFlexDates.length > 0 && (
              <span className="text-[var(--color-warning)]">
                {" "}
                — {nonOperatingFlexDates.map(formatDateLabel).join(", ")} skipped (not an operating day)
              </span>
            )}
          </p>
        )}
        {exceedsMaxDays && (
          <p className="text-sm text-[var(--color-danger)]">
            That's {requestedDates.length} days — bookings can't exceed {MAX_BOOKING_DAYS} operating days.
          </p>
        )}
      </section>

      {/* ---------- Availability & seat ---------- */}
      {branchId && workstationId && requestedDates.length > 0 && !exceedsMaxDays && (
        <section className="space-y-4 rounded-2xl border border-[var(--color-line)] bg-white p-5">
          <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">4. Pick a seat</p>

          <Button variant="outline" size="sm" onClick={handleCheckAvailability} disabled={availabilityLoading}>
            {availabilityLoading ? <Loader2 size={14} className="animate-spin" /> : "Check availability"}
          </Button>

          {availabilityError && <p className="text-sm text-[var(--color-danger)]">{availabilityError}</p>}

          {availability && (
            <div className="space-y-2">
              {availableSeats.length === 0 ? (
                <p className="text-sm text-slate-400">No seats are free across all the days you selected.</p>
              ) : (
                availableSeats.map((seat) => (
                  <label
                    key={seat.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                      selectedSeatId === seat.id
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                        : "border-[var(--color-line)] hover:border-slate-300"
                    }`}
                  >
                    <span className="font-medium text-[var(--color-primary)]">Seat {seat.seatId}</span>
                    <input
                      type="radio"
                      name="seat"
                      checked={selectedSeatId === seat.id}
                      onChange={() => setSelectedSeatId(seat.id)}
                    />
                  </label>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {/* ---------- Review & submit ---------- */}
      {selectedSeatId && (
        <section className="space-y-4 rounded-2xl border border-[var(--color-line)] bg-white p-5">
          <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">5. Review</p>
          <div className="space-y-1.5 text-sm text-slate-600">
            <p>
              {requestedDates.length} day{requestedDates.length === 1 ? "" : "s"} × ₦
              {Number(workstation.pricePerDay).toLocaleString()}/day
            </p>
            <p className="text-lg font-bold text-[var(--color-primary)]">
              Total: ₦{totalPrice.toLocaleString()}
            </p>
            <p className={canAffordBooking ? "text-slate-400" : "text-[var(--color-danger)]"}>
              Wallet balance: ₦{balance.toLocaleString()}
              {!canAffordBooking && " — insufficient, top up your wallet first"}
            </p>
          </div>

          {submitError && <p className="text-sm text-[var(--color-danger)]">{submitError}</p>}

          <Button className="w-full" onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? "Confirming..." : "Confirm booking"}
          </Button>
        </section>
      )}
    </div>
  );
}
