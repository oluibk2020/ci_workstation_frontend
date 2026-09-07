import { useState } from "react";
import { Send, Users } from "lucide-react";
import Button from "../../components/common/Button";
import { notificationService } from "../../services/notificationService";

export default function NotificationBroadcastPage() {
  const [form, setForm] = useState({ title: "", message: "" });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback({ type: "", message: "" });
    setSending(true);
    try {
      const result = await notificationService.broadcast(form);
      setFeedback({ type: "success", message: result?.sentCount != null ? `Notification sent to ${result.sentCount} active client${result.sentCount === 1 ? "" : "s"}.` : "Notification sent successfully." });
      setForm({ title: "", message: "" });
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Could not send notification." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Send Notifications</h1>
        <p className="mt-1 text-sm text-slate-500">Send an in-app announcement to every active user account.</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[var(--color-line)] bg-white p-4">
        <Users size={20} className="mt-0.5 text-[var(--color-accent)]" />
        <div><p className="text-sm font-semibold text-slate-800">Audience</p><p className="text-xs text-slate-500">All active user accounts receive this notification, including Staff and Admin accounts.</p></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[var(--color-line)] bg-white p-6">
        <div>
          <label className="text-sm font-medium text-slate-700">Title</label>
          <input maxLength={120} required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none" placeholder="Important update" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Message</label>
          <textarea maxLength={5000} required rows={7} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="mt-1.5 w-full resize-y rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none" placeholder="Write the announcement here..." />
          <p className="mt-1 text-right text-xs text-slate-400">{form.message.length}/5000</p>
        </div>
        {feedback.message && <p className={`text-sm ${feedback.type === "success" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>{feedback.message}</p>}
        <Button type="submit" disabled={sending || !form.title.trim() || !form.message.trim()}>
          <Send size={16} />
          {sending ? "Sending..." : "Send to all active users"}
        </Button>
      </form>
    </div>
  );
}
