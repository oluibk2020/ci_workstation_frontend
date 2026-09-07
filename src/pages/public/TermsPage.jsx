export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-10">
      <div>
        <p className="font-mono-tight text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">Legal</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--color-primary)]">Terms and Conditions</h1>
        <p className="mt-2 text-sm text-slate-500">Version 1.0 · Effective September 7, 2026</p>
      </div>
      <section className="space-y-6 rounded-2xl border border-[var(--color-line)] bg-white p-6 text-sm leading-7 text-slate-600">
        <div><h2 className="font-semibold text-slate-900">1. Account registration</h2><p>You must provide accurate information and keep your account credentials secure. One person must not create or operate accounts fraudulently or impersonate another person.</p></div>
        <div><h2 className="font-semibold text-slate-900">2. Workstation bookings</h2><p>Bookings are made for specific dates and are subject to availability. A booking may be made for yourself or another eligible user. You remain responsible for the accuracy of booking information.</p></div>
        <div><h2 className="font-semibold text-slate-900">3. Rescheduling and cancellation</h2><p>Bookings cannot be cancelled. Eligible bookings may be rescheduled before the applicable 48-hour cutoff, subject to availability and the rules displayed at the time of rescheduling.</p></div>
        <div><h2 className="font-semibold text-slate-900">4. Check-in and QR passes</h2><p>Users must present the correct QR pass and comply with identity and verification requirements. QR passes must not be shared except where the booking flow explicitly permits a booking for another person.</p></div>
        <div><h2 className="font-semibold text-slate-900">5. Conduct and house rules</h2><p>Users must use workstations, internet access, equipment, and facilities responsibly. Unsafe, abusive, fraudulent, unlawful, or disruptive conduct may result in suspension or termination of access.</p></div>
        <div><h2 className="font-semibold text-slate-900">6. Payments and wallet</h2><p>Wallet balances and payment transactions are recorded against your account. You must not attempt unauthorized payment activity, chargeback abuse, or manipulation of wallet credits.</p></div>
        <div><h2 className="font-semibold text-slate-900">7. Privacy and communications</h2><p>We process account, booking, verification, payment, and operational information to provide the service. We may send service notifications about bookings, account security, payments, and important operational announcements.</p></div>
        <div><h2 className="font-semibold text-slate-900">8. Suspension</h2><p>We may suspend or restrict access where necessary for security, fraud prevention, non-payment, misuse, or material breach of these terms.</p></div>
        <div><h2 className="font-semibold text-slate-900">9. Changes</h2><p>We may update these terms when the service or legal requirements change. Where a new acceptance is required, you will be asked to review and accept the new version.</p></div>
        <div><h2 className="font-semibold text-slate-900">10. Contact</h2><p>Questions about these terms should be directed to the Workstation support team through the contact channel provided on the website.</p></div>
      </section>
    </div>
  );
}
