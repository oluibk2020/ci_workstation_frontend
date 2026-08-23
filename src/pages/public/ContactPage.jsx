import { useState } from "react";
import Eyebrow from "../../components/common/Eyebrow";
import Button from "../../components/common/Button";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: wire up to a contact/notification endpoint once the backend exists
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <Eyebrow>Contact</Eyebrow>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
        Talk to us
      </h1>
      <p className="mt-3 text-slate-500">
        Questions about a location, a booking, or setting up a corporate plan? Send a message and
        we'll get back to you.
      </p>

      {sent ? (
        <div className="mt-8 rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-6 text-sm text-[var(--color-success)]">
          Thanks — your message has been sent. We'll reply by email shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              required
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Message</label>
            <textarea
              required
              rows={4}
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>
          <Button type="submit">Send message</Button>
        </form>
      )}
    </div>
  );
}
