import { useState } from "react";
import { Mail, Users } from "lucide-react";
import Button from "../../components/common/Button";
import { notificationService } from "../../services/notificationService";

export default function EmailBroadcastPage() {
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback({ type: "", message: "" });
    setSending(true);
    try {
      const result = await notificationService.broadcastEmail(form);
      const data = result?.data || result || {};
      setFeedback({
        type: data.failedCount > 0 ? "warning" : "success",
        message:
          data.failedCount > 0
            ? `Email sent to ${data.sentCount || 0} users. ${data.failedCount} recipients could not be reached.`
            : `Email successfully sent to ${data.sentCount || 0} users.`,
      });
      setForm({ subject: "", message: "" });
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Could not send email." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Email Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          Send an email announcement separately from the in-app notification system.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[var(--color-line)] bg-white p-4">
        <Users size={20} className="mt-0.5 text-[var(--color-accent)]" />
        <div>
          <p className="text-sm font-semibold text-slate-800">Audience</p>
          <p className="text-xs text-slate-500">
            All active user accounts with an email address, including clients, Staff and Admin accounts.
            Recipient addresses are sent using BCC and are not exposed to other users.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[var(--color-line)] bg-white p-6">
        <div>
          <label className="text-sm font-medium text-slate-700">Subject</label>
          <input
            maxLength={180}
            required
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="Important Workstation update"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Email message</label>
          <textarea
            maxLength={10000}
            required
            rows={10}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="mt-1.5 w-full resize-y rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="Write the email announcement here..."
          />
          <p className="mt-1 text-right text-xs text-slate-400">{form.message.length}/10000</p>
        </div>

        {feedback.message && (
          <p className={`text-sm ${feedback.type === "success" ? "text-[var(--color-success)]" : feedback.type === "warning" ? "text-amber-600" : "text-[var(--color-danger)]"}`}>
            {feedback.message}
          </p>
        )}

        <Button type="submit" disabled={sending || !form.subject.trim() || !form.message.trim()}>
          <Mail size={16} />
          {sending ? "Sending email..." : "Send email to all users"}
        </Button>
      </form>
    </div>
  );
}
