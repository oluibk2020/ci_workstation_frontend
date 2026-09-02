import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, LogIn, Loader2 } from "lucide-react";
import { qrService } from "../../services/qrService";
import { checkinService } from "../../services/checkinService";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/common/Logo";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { ROLES } from "../../utils/constants";

/**
 * This is the literal page a scanned QR points to — the backend encodes
 * `${FRONTEND_URL}/u/:token` directly into the QR image (see
 * qrCodeService.js / docs/BACKEND_CODE_REVIEW.md §3). Someone scans a
 * client's QR with their phone camera and lands here directly; it isn't
 * a staff-only "paste a code" tool.
 *
 * Resolving the QR (GET /qr/public/:token) needs no auth — anyone can see
 * whose QR it is and whether they have a booking today. Actually
 * triggering check-in/check-out DOES need to be logged in as the person
 * themselves (self-check-in) or as Staff/Super Admin (checking someone
 * else in) — the backend enforces this; this page just doesn't show the
 * button otherwise.
 *
 * NEW backend fix that made this page possible: resolveQRCode previously
 * never returned the BookingDate id that checkinService.checkIn requires
 * — patched alongside building this (see docs/PATCH_NOTES.md).
 */
export default function QRResolvePage() {
  const { token } = useParams();
  const { user, role, isAuthenticated } = useAuth();

  const [resolved, setResolved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionResult, setActionResult] = useState(null); // the CheckIn record after a successful action

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await qrService.resolve(token);
      setResolved(result);
    } catch (err) {
      setError(err.message || "This QR code is invalid or has been revoked.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const canAct = isAuthenticated && resolved && (user.id === resolved.user.id || [ROLES.MANAGER, ROLES.ADMIN].includes(role));

  async function handleCheckIn() {
    setActionLoading(true);
    setActionError("");
    try {
      const targetUserId = user.id === resolved.user.id ? undefined : resolved.user.id;
      const result = await checkinService.checkIn(resolved.currentBooking.bookingDateId, targetUserId);
      setActionResult(result);
    } catch (err) {
      setActionError(err.message || "Couldn't check in right now.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckOut() {
    if (!actionResult?.id) return;
    setActionLoading(true);
    setActionError("");
    try {
      const result = await checkinService.checkOut(actionResult.id);
      setActionResult(result);
    } catch (err) {
      setActionError(err.message || "Couldn't check out right now.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-8 text-center">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 size={32} className="animate-spin text-slate-300" />
              <p className="text-sm text-slate-400">Checking this pass...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-8">
              <XCircle size={40} className="text-[var(--color-danger)]" />
              <p className="font-semibold text-[var(--color-primary)]">Invalid pass</p>
              <p className="text-sm text-slate-500">{error}</p>
            </div>
          )}

          {!loading && resolved && (
            <div className="space-y-5">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-primary)] text-lg font-semibold text-white">
                  {resolved.user.name?.[0]?.toUpperCase() || "?"}
                </div>
                <p className="mt-3 text-lg font-bold text-[var(--color-primary)]">{resolved.user.name}</p>
                <div className="mt-1.5 flex justify-center">
                  <Badge status={resolved.user.verificationStatus}>{resolved.user.verificationStatus}</Badge>
                </div>
              </div>

              <div className="border-t border-[var(--color-line)] pt-5 text-left">
                <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Today's booking
                </p>
                {resolved.currentBooking ? (
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p className="font-medium text-[var(--color-primary)]">
                      {resolved.currentBooking.workstation.name} — {resolved.currentBooking.branch.name}
                    </p>
                    <p>Seat {resolved.currentBooking.seat.seatId}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">No booking for today.</p>
                )}
              </div>

              {actionError && <p className="text-sm text-[var(--color-danger)]">{actionError}</p>}

              {resolved.currentBooking && canAct && (
                <div className="border-t border-[var(--color-line)] pt-5">
                  {!actionResult ? (
                    <Button className="w-full" onClick={handleCheckIn} disabled={actionLoading}>
                      {actionLoading ? "Checking in..." : "Check in"}
                    </Button>
                  ) : actionResult.status === "CHECKED_IN" ? (
                    <>
                      <p className="mb-3 flex items-center justify-center gap-1.5 text-sm text-[var(--color-success)]">
                        <CheckCircle2 size={16} />
                        Checked in
                      </p>
                      <Button className="w-full" variant="outline" onClick={handleCheckOut} disabled={actionLoading}>
                        {actionLoading ? "Checking out..." : "Check out"}
                      </Button>
                    </>
                  ) : (
                    <p className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
                      <CheckCircle2 size={16} />
                      Checked out
                    </p>
                  )}
                </div>
              )}

              {resolved.currentBooking && !canAct && (
                <div className="border-t border-[var(--color-line)] pt-5">
                  <p className="mb-3 flex items-center justify-center gap-1.5 text-sm text-slate-500">
                    <LogIn size={16} />
                    Log in as staff to check this person in
                  </p>
                  <Button as={Link} to="/login" variant="outline" className="w-full">
                    Log in
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
