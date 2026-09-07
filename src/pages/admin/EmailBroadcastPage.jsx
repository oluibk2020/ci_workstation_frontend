import { useEffect, useState } from "react";
import { Mail, Search, Send, Users, UserRound } from "lucide-react";
import Button from "../../components/common/Button";
import { notificationService } from "../../services/notificationService";
import { adminUserService } from "../../services/adminUserService";
import { USER_STATUS } from "../../utils/constants";

const EMPTY_FORM = { subject: "", message: "" };

export default function EmailBroadcastPage() {
  const [mode, setMode] = useState("all");
  const [form, setForm] = useState(EMPTY_FORM);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    if (mode !== "individual") return;

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const result = await adminUserService.list({
          search: userSearch.trim() || undefined,
          status: USER_STATUS.ACTIVE,
          page: 1,
          limit: 50,
        });
        if (!cancelled) setUsers(result?.users || []);
      } catch (err) {
        if (!cancelled) setFeedback({ type: "error", message: err.message || "Could not load users." });
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [mode, userSearch]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setSelectedUser(null);
    setFeedback({ type: "", message: "" });
    setUserSearch("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback({ type: "", message: "" });

    if (mode === "individual" && !selectedUser) {
      setFeedback({ type: "error", message: "Please select a user before sending." });
      return;
    }

    setSending(true);
    try {
      if (mode === "individual") {
        const result = await notificationService.sendEmailToUser({
          userId: selectedUser.id,
          ...form,
        });
        setFeedback({ type: "success", message: result?.message || `Email sent successfully to ${selectedUser.name}.` });
      } else {
        const result = await notificationService.broadcastEmail(form);
        const data = result?.data || result || {};
        setFeedback({
          type: data.failedCount > 0 ? "warning" : "success",
          message:
            data.failedCount > 0
              ? `Email sent to ${data.sentCount || 0} users. ${data.failedCount} recipients could not be reached.`
              : `Email successfully sent to ${data.sentCount || 0} users.`,
        });
      }
      setForm(EMPTY_FORM);
      if (mode === "individual") setSelectedUser(null);
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Could not send email." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Email Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          Send email separately from the in-app notification system — to everyone or to one specific user.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => switchMode("all")}
          className={`rounded-2xl border p-4 text-left transition-all ${mode === "all" ? "border-[var(--color-accent)] bg-blue-50 shadow-sm" : "border-[var(--color-line)] bg-white hover:border-blue-200"}`}
        >
          <Users size={20} className="mb-2 text-[var(--color-accent)]" />
          <p className="font-semibold text-slate-800">All active users</p>
          <p className="mt-1 text-xs text-slate-500">Send one announcement to every active account with an email.</p>
        </button>
        <button
          type="button"
          onClick={() => switchMode("individual")}
          className={`rounded-2xl border p-4 text-left transition-all ${mode === "individual" ? "border-[var(--color-accent)] bg-blue-50 shadow-sm" : "border-[var(--color-line)] bg-white hover:border-blue-200"}`}
        >
          <UserRound size={20} className="mb-2 text-[var(--color-accent)]" />
          <p className="font-semibold text-slate-800">Individual user</p>
          <p className="mt-1 text-xs text-slate-500">Find one active user and send a private email directly to them.</p>
        </button>
      </div>

      {mode === "individual" && (
        <section className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Choose recipient</h2>
              <p className="text-xs text-slate-500">Search by name or email.</p>
            </div>
            {selectedUser && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Recipient selected</span>}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] px-3 py-2.5">
            <Search size={17} className="text-slate-400" />
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {selectedUser && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 p-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{selectedUser.name}</p>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} className="text-xs font-medium text-blue-700 hover:underline">Change</button>
            </div>
          )}

          {!selectedUser && users.length > 0 && (
            <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-[var(--color-line)]">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUser(user)}
                  className="flex w-full items-center gap-3 border-b border-[var(--color-line)] px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500"><UserRound size={16} /></div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!selectedUser && userSearch && users.length === 0 && <p className="mt-3 text-sm text-slate-400">No active users found.</p>}
        </section>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
          <Mail size={20} className="text-[var(--color-accent)]" />
          <div>
            <p className="text-sm font-semibold text-slate-800">{mode === "all" ? "Broadcast email" : "Private email"}</p>
            <p className="text-xs text-slate-500">
              {mode === "all" ? "Recipients are delivered in BCC batches so their addresses remain private." : selectedUser ? `Sending directly to ${selectedUser.email}.` : "Select a recipient above."}
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Subject</label>
          <input maxLength={180} required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none" placeholder="Important Workstation update" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Email message</label>
          <textarea maxLength={10000} required rows={10} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="mt-1.5 w-full resize-y rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none" placeholder="Write the email message here..." />
          <p className="mt-1 text-right text-xs text-slate-400">{form.message.length}/10000</p>
        </div>

        {feedback.message && (
          <p className={`rounded-lg p-3 text-sm ${feedback.type === "success" ? "bg-green-50 text-[var(--color-success)]" : feedback.type === "warning" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-[var(--color-danger)]"}`}>{feedback.message}</p>
        )}

        <Button type="submit" disabled={sending || !form.subject.trim() || !form.message.trim() || (mode === "individual" && !selectedUser)}>
          <Send size={16} />
          {sending ? "Sending email..." : mode === "all" ? "Send email to all users" : "Send email to selected user"}
        </Button>
      </form>
    </div>
  );
}
