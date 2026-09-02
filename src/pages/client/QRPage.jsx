import { useState, useEffect, useCallback } from "react";
import { QrCode, RefreshCw, ShieldOff, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { qrService } from "../../services/qrService";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";

/**
 * The one feature on the backend that is fully implemented, confirmed
 * working, and requires no Paystack/SMTP credentials to use — QR
 * generation is wired for real here.
 *
 * The QR image itself is rendered with `qrcode.react` — entirely
 * client-side (SVG, no network call). An earlier version of this page
 * called a third-party API (api.qrserver.com) to generate the image over
 * the network, which is fragile: it silently fails to load if that
 * domain is blocked, slow, rate-limited, or down on someone's network,
 * and it also meant sending the QR's raw token to an outside service for
 * no good reason. This version has no such dependency.
 *
 * REAL LIMITATION, not a frontend gap (see docs/BACKEND_CODE_REVIEW.md):
 * GET /qr/me only confirms an active QR *exists* (status, generatedAt) —
 * it never returns the scannable token/URL. Only POST /qr/generate
 * returns that, because the raw token is never stored server-side (only
 * its hash) — it can only ever be handed back once, at generation time.
 * There is currently no way to re-view an existing QR pass without
 * generating a new one, which immediately revokes the old one. This page
 * is built around that real constraint rather than hiding it: viewing
 * your QR for the first time in a session always means generating one.
 */
export default function QRPage() {
  const [status, setStatus] = useState(null); // { status, generatedAt } from GET /qr/me
  const [qrUrl, setQrUrl] = useState(null); // only ever populated by generate()
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const current = await qrService.getCurrent();
      setStatus(current);
    } catch (err) {
      setError(err.message || "Couldn't check your QR status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  async function handleGenerate() {
    setActionLoading(true);
    setError("");
    try {
      const result = await qrService.generate();
      setQrUrl(result.qrUrl);
      setStatus({ status: result.status, generatedAt: result.generatedAt });
    } catch (err) {
      setError(err.message || "Couldn't generate your QR pass.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRevoke() {
    setActionLoading(true);
    setError("");
    try {
      await qrService.revoke();
      setStatus(null);
      setQrUrl(null);
    } catch (err) {
      setError(err.message || "Couldn't revoke your QR pass.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCopy() {
    if (!qrUrl) return;
    await navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">My QR Pass</h1>
        <p className="text-sm text-slate-500">
          One persistent QR identity, tied to your account — staff scan it to check you in.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 sm:p-8">
        {loading ? (
          <p className="text-sm text-slate-400">Checking your QR status...</p>
        ) : qrUrl ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-xl border border-[var(--color-line)] p-4">
              <QRCodeSVG value={qrUrl} size={220} />
            </div>
            <div className="flex items-center gap-2">
              <Badge status="ACTIVE" />
              <span className="text-xs text-slate-400">Show this to staff at check-in</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)] hover:underline"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        ) : status ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <QrCode size={40} className="text-slate-300" />
            <div>
              <p className="font-medium text-[var(--color-primary)]">You have an active QR pass</p>
              <p className="mt-1 text-sm text-slate-500">
                For security, the scannable code itself isn't kept on file — generate it again to
                view it. This will replace your current one.
              </p>
            </div>
            <Button onClick={handleGenerate} disabled={actionLoading}>
              <RefreshCw size={16} />
              {actionLoading ? "Generating..." : "View / Regenerate QR"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <QrCode size={40} className="text-slate-300" />
            <p className="text-sm text-slate-500">You don't have an active QR pass yet.</p>
            <Button onClick={handleGenerate} disabled={actionLoading}>
              <QrCode size={16} />
              {actionLoading ? "Generating..." : "Generate QR pass"}
            </Button>
          </div>
        )}
      </div>

      {status && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleRevoke} disabled={actionLoading}>
            <ShieldOff size={14} />
            Revoke my QR pass
          </Button>
        </div>
      )}
    </div>
  );
}
