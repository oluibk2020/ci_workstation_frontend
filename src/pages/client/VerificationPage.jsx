import { useState } from "react";
import { ShieldCheck, Upload, CheckCircle2 } from "lucide-react";
import { verificationService, fileToDataUri } from "../../services/verificationService";
import { ID_DOCUMENT_TYPE } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";

const DOCUMENT_LABELS = {
  [ID_DOCUMENT_TYPE.NATIONAL_ID]: "National ID",
  [ID_DOCUMENT_TYPE.PASSPORT]: "Passport",
  [ID_DOCUMENT_TYPE.DRIVERS_LICENSE]: "Driver's License",
  [ID_DOCUMENT_TYPE.VOTERS_CARD]: "Voter's Card",
  [ID_DOCUMENT_TYPE.OTHERS]: "Other",
};

export default function VerificationPage() {
  const { verificationStatus } = useAuth();
  const [documentType, setDocumentType] = useState(ID_DOCUMENT_TYPE.NATIONAL_ID);
  const [documentNumber, setDocumentNumber] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const dataUri = await fileToDataUri(selected);
    setFilePreview(dataUri);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!filePreview) return;
    setSubmitting(true);
    setError("");
    try {
      await verificationService.submit([
        {
          type: documentType,
          documentNumber: documentNumber.trim() || undefined,
          documentUrl: filePreview,
        },
      ]);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Couldn't submit your verification. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (verificationStatus === "VERIFIED") {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-[var(--color-line)] bg-white p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-[var(--color-success)]" />
        <h1 className="text-xl font-bold text-[var(--color-primary)]">You're verified</h1>
        <p className="text-sm text-slate-500">No further action needed — you're clear for check-in.</p>
      </div>
    );
  }

  if (success || verificationStatus === "PENDING") {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-[var(--color-line)] bg-white p-8 text-center">
        <ShieldCheck size={40} className="mx-auto text-[var(--color-warning)]" />
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Verification pending review</h1>
        <p className="text-sm text-slate-500">
          Your document has been submitted. Staff will review it before your first check-in.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Identity Verification</h1>
        <p className="text-sm text-slate-500">
          Required before your first check-in.{" "}
          <Badge status={verificationStatus === "REJECTED" ? "REJECTED" : "UNVERIFIED"}>{verificationStatus}</Badge>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[var(--color-line)] bg-white p-6">
        <div>
          <label className="text-sm font-medium text-slate-700">Document type</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          >
            {Object.entries(DOCUMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Document number (optional)</label>
          <input
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Upload a clear photo of your document</label>
          <label className="mt-1.5 flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-[var(--color-line)] p-6 text-center hover:border-slate-300">
            {filePreview ? (
              <img src={filePreview} alt="Document preview" className="max-h-40 rounded-lg" />
            ) : (
              <>
                <Upload size={24} className="text-slate-300" />
                <span className="text-xs text-slate-400">Click to choose a file</span>
              </>
            )}
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting || !filePreview}>
          {submitting ? "Submitting..." : "Submit for review"}
        </Button>
      </form>
    </div>
  );
}
