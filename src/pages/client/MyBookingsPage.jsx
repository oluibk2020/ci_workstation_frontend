import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus } from "lucide-react";
import { bookingService } from "../../services/bookingService";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cancel modal state
  const [cancelling, setCancelling] = useState(null); // { booking, date }
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // Reassign modal state
  const [reassigning, setReassigning] = useState(null); // { booking, date }
  const [newDate, setNewDate] = useState("");
  const [reassignSubmitting, setReassignSubmitting] = useState(false);
  const [reassignError, setReassignError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await bookingService.list();
      setBookings(result.bookings || result || []);
    } catch (err) {
      setError(err.message || "Couldn't load your bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleConfirmCancel() {
    if (!cancelling) return;
    setCancelSubmitting(true);
    setCancelError("");
    try {
      await bookingService.cancel(cancelling.booking.id, [cancelling.date]);
      setCancelling(null);
      await load();
    } catch (err) {
      setCancelError(err.message || "Couldn't cancel this date.");
    } finally {
      setCancelSubmitting(false);
    }
  }

  async function handleConfirmReassign() {
    if (!reassigning || !newDate) return;
    setReassignSubmitting(true);
    setReassignError("");
    try {
      await bookingService.reassign(reassigning.booking.id, [{ fromDate: reassigning.date, toDate: newDate }]);
      setReassigning(null);
      setNewDate("");
      await load();
    } catch (err) {
      setReassignError(err.message || "Couldn't reassign this date.");
    } finally {
      setReassignSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading your bookings...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">My Bookings</h1>
          <p className="text-sm text-slate-500">
            Cancel a future date for a wallet credit, or reassign it to a different date — up to 3
            reassignment operations a month.
          </p>
        </div>
        <Button as={Link} to="/client/book">
          <CalendarPlus size={16} />
          New booking
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {bookings.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-16 text-center">
          <p className="text-sm text-slate-500">No bookings yet.</p>
          <Button as={Link} to="/client/book" size="sm">
            Book a workstation
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-[var(--color-primary)]">
                  {booking.workstation?.name} — {booking.branch?.name}
                </p>
                <p className="text-xs text-slate-400">Seat {booking.seat?.seatId}</p>
              </div>
              <Badge status={booking.status} />
            </div>

            <div className="mt-4 divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
              {(booking.dates || []).map((d) => (
                <div key={d.id || d.bookingDate} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono-tight text-sm text-slate-600">
                      {new Date(d.bookingDate).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <Badge status={d.status} />
                  </div>
                  {d.status === "ACTIVE" && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setReassigning({ booking, date: d.bookingDate.slice(0, 10) })}>
                        Reassign
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCancelling({ booking, date: d.bookingDate.slice(0, 10) })}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Cancel modal ---------- */}
      <Modal open={!!cancelling} onClose={() => setCancelling(null)} title="Cancel this date">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This won't refund cash — the value of this date will be credited to your wallet, usable
            only for future bookings. This can't be undone.
          </p>
          {cancelError && <p className="text-sm text-[var(--color-danger)]">{cancelError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCancelling(null)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel} disabled={cancelSubmitting}>
              {cancelSubmitting ? "Cancelling..." : "Cancel this date"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ---------- Reassign modal ---------- */}
      <Modal open={!!reassigning} onClose={() => setReassigning(null)} title="Reassign this date">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Move this booking to a different date. This counts as one of your 3 reassignment
            operations this month.
          </p>
          <div>
            <label className="text-sm font-medium text-slate-700">New date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>
          {reassignError && <p className="text-sm text-[var(--color-danger)]">{reassignError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setReassigning(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReassign} disabled={reassignSubmitting || !newDate}>
              {reassignSubmitting ? "Reassigning..." : "Reassign"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
