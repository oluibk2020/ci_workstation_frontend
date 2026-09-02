import { useState } from "react";
import { User, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { fileToDataUri } from "../../services/verificationService";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

export default function ProfilePage() {
  const { user, role, verificationStatus, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [photoPreview, setPhotoPreview] = useState(user?.profileImageUrl || null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUri = await fileToDataUri(file);
    setPhotoPreview(dataUri);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSaved(false);
    try {
      const { user: updated } = await authService.updateProfile({
        name,
        profileImageUrl: photoPreview !== user?.profileImageUrl ? photoPreview : undefined,
      });
      updateUser(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message || "Couldn't save your profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Profile</h1>
        <p className="text-sm text-slate-500">Your account details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[var(--color-line)] bg-white p-6">
        <div className="flex items-center gap-4">
          <label className="cursor-pointer">
            {photoPreview ? (
              <img src={photoPreview} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--color-primary)] text-white">
                <User size={24} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
          <div>
            <p className="text-sm font-medium text-[var(--color-primary)]">Profile photo</p>
            <p className="text-xs text-slate-400">Click to change</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            value={user?.email || ""}
            disabled
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-slate-50 px-3 py-2.5 text-sm text-slate-400"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
          <span className="text-slate-500">Role</span>
          <span className="font-medium text-[var(--color-primary)]">{role}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
          <span className="text-slate-500">Verification</span>
          <Badge status={verificationStatus}>{verificationStatus}</Badge>
        </div>

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        {saved && (
          <p className="flex items-center gap-1.5 text-sm text-[var(--color-success)]">
            <CheckCircle2 size={16} />
            Saved.
          </p>
        )}

        <Button type="submit" className="w-full" disabled={submitting || !name.trim()}>
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
