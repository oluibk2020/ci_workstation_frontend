import { useState } from "react";
import { QrCode, CheckCircle2, Loader2 } from "lucide-react";
import { qrService } from "../../services/qrService";
import { checkinService } from "../../services/checkinService";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

/**
 * A scanned QR opens `/u/:token` directly on whoever's phone scanned it
 * (see QRResolvePage.jsx) — there's no in-app camera scanner here, that's
 * a separate feature. This page is the fallback for when that's not
 * practical (damaged QR display, no camera handy): paste the token or the
 * full QR URL and look it up the same way.
 */
function extractToken(input) {
  const trimmed = input.trim();
  const match = trimmed.match(/\/u\/([^/?#]+)/);
  return match ? match[1] : trimmed;
}

export default function StaffScanPage() {
  const [input, setInput] = useState("");
  const [resolved, setResolved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionResult, setActionResult] = useState(null);

  async function handleLookup(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResolved(null);
    setActionResult(null);
    try {
      const result = await qrService.resolve(extractToken(input));
      setResolved(result);
    } catch (err) {
      setError(err.message || "This QR code is invalid or has been revoked.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    setActionLoading(true);
    setActionError("");
    try {
      const result = await checkinService.checkIn(resolved.currentBooking.bookingDateId, resolved.user.id);
      setActionResult(result);
    } catch (err) {
      setActionError(err.message || "Couldn't check in right now.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Scan QR</h1>
        <p className="text-sm text-slate-500">
          Normally a scan opens directly on the client's phone. Use this if that's not practical —
          paste the QR token or the full link instead.
        </p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-2 rounded-2xl border border-[var(--color-line)] bg-white p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste QR token or link..."
          className="w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
          Look up
        </Button>
      </form>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {resolved && (
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--color-primary)] text-base font-semibold text-white">
            {resolved.user.name?.[0]?.toUpperCase() || "?"}
          </div>
          <p className="mt-3 font-bold text-[var(--color-primary)]">{resolved.user.name}</p>
          <div className="mt-1.5 flex justify-center">
            <Badge status={resolved.user.verificationStatus}>{resolved.user.verificationStatus}</Badge>
          </div>

          <div className="mt-4 border-t border-[var(--color-line)] pt-4 text-left text-sm text-slate-600">
            {resolved.currentBooking ? (
              <>
                <p className="font-medium text-[var(--color-primary)]">
                  {resolved.currentBooking.workstation.name} — {resolved.currentBooking.branch.name}
                </p>
                <p>Seat {resolved.currentBooking.seat.seatId}</p>
              </>
            ) : (
              <p className="text-slate-400">No booking for today.</p>
            )}
          </div>

          {actionError && <p className="mt-3 text-sm text-[var(--color-danger)]">{actionError}</p>}

          {resolved.currentBooking && (
            <div className="mt-4 border-t border-[var(--color-line)] pt-4">
              {actionResult ? (
                <p className="flex items-center justify-center gap-1.5 text-sm text-[var(--color-success)]">
                  <CheckCircle2 size={16} />
                  Checked in
                </p>
              ) : (
                <Button className="w-full" onClick={handleCheckIn} disabled={actionLoading}>
                  {actionLoading ? "Checking in..." : "Check in"}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
