import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, User } from "lucide-react";
import { verificationService } from "../../services/verificationService";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";

/**
 * Shared by both Staff and Admin — same queue, same actions. Mounted at
 * both /staff/verifications and /admin/verifications.
 */
export default function VerificationQueuePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rejecting, setRejecting] = useState(null); // verification object
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await verificationService.listPending();
      setItems(result.verifications || []);
    } catch (err) {
      setError(err.message || "Couldn't load pending verifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove(verificationId) {
    setActionLoading(true);
    setActionError("");
    try {
      await verificationService.review(verificationId, true);
      await load();
    } catch (err) {
      setActionError(err.message || "Couldn't approve this request.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!rejecting || !rejectionReason.trim()) return;
    setActionLoading(true);
    setActionError("");
    try {
      await verificationService.review(rejecting.id, false, rejectionReason.trim());
      setRejecting(null);
      setRejectionReason("");
      await load();
    } catch (err) {
      setActionError(err.message || "Couldn't reject this request.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-400">Loading pending verifications...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Verification Requests</h1>
        <p className="text-sm text-slate-500">Review submitted ID documents before someone's first check-in.</p>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      {actionError && <p className="text-sm text-[var(--color-danger)]">{actionError}</p>}

      {items.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-white/60 px-6 py-16 text-center">
          <CheckCircle2 size={28} className="text-slate-300" />
          <p className="text-sm text-slate-500">No pending verifications.</p>
        </div>
      )}

      <div className="space-y-4">
        {items.map((v) => (
          <div key={v.id} className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-primary)] text-white">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-primary)]">{v.user.name}</p>
                  <p className="text-xs text-slate-400">{v.user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setRejecting(v)} disabled={actionLoading}>
                  <XCircle size={14} />
                  Reject
                </Button>
                <Button size="sm" onClick={() => handleApprove(v.id)} disabled={actionLoading}>
                  <CheckCircle2 size={14} />
                  Approve
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 border-t border-[var(--color-line)] pt-4">
              {v.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-lg border border-[var(--color-line)]"
                >
                  <img src={doc.documentUrl} alt={doc.type} className="h-24 w-32 object-cover" />
                  <p className="bg-slate-50 px-2 py-1 text-center text-xs text-slate-500">{doc.type}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title={`Reject ${rejecting?.user.name}'s request`}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              placeholder="e.g. Document image is unreadable"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} disabled={actionLoading || !rejectionReason.trim()}>
              {actionLoading ? "Rejecting..." : "Reject request"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
