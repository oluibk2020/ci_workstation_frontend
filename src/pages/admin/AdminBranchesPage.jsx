import { useState } from "react";
import { MapPin, Plus, Loader2 } from "lucide-react";
import { useCatalog } from "../../context/CatalogContext";
import BranchFormModal from "../../components/branch/BranchFormModal";
import Button from "../../components/common/Button";

// Wired to the real backend. NOTE: only branch creation exists on their
// API right now (POST /admin/branches) — no update or delete route
// anywhere, so this page deliberately doesn't offer either. See
// docs/BACKEND_CODE_REVIEW.md.
export default function AdminBranchesPage() {
  const { branches, isLoading, error, getWorkstationsForBranch, addBranch } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(data) {
    setSubmitting(true);
    setSubmitError("");
    try {
      await addBranch(data);
      setModalOpen(false);
    } catch (err) {
      setSubmitError(err.message || "Couldn't create the branch.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">Branches</h1>
          <p className="text-sm text-slate-500">
            Only Super Admins can create branches. Pricing is set per workstation type, not here.
            Editing and removing a branch aren't available yet — the backend has no route for either.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          New branch
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading branches...
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {branches.map((branch) => {
            const workstationCount = getWorkstationsForBranch(branch.id).length;
            return (
              <div key={branch.id} className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <MapPin size={18} />
                  <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide">{branch.name}</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">{branch.address}</p>
                <p className="mt-2 font-mono-tight text-xs text-slate-400">
                  {branch.openingTime}–{branch.closingTime} · {branch.timezone} ·{" "}
                  {Array.isArray(branch.operatingDays) ? branch.operatingDays.join(", ") : ""}
                </p>
                <div className="mt-4 border-t border-[var(--color-line)] pt-4 text-sm text-slate-500">
                  {workstationCount} workstation type{workstationCount === 1 ? "" : "s"}
                </div>
              </div>
            );
          })}
          {branches.length === 0 && <p className="text-sm text-slate-400">No branches yet — create the first one.</p>}
        </div>
      )}

      <BranchFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitError={submitError}
      />
    </div>
  );
}
