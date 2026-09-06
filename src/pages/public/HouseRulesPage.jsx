import Eyebrow from "../../components/common/Eyebrow";

/**
 * NEW — the "10 Golden Rules" poster, requested directly. Linked from
 * the site footer (every page) and prominently from the Landing page.
 * Named "House Rules" rather than "Terms & Conditions" since that's
 * genuinely what the content is — a physical coworking space's code of
 * conduct, not a legal terms-of-service document. If a separate, real
 * Terms & Conditions / legal agreement is ever needed later, that should
 * be its own page rather than folded into this one.
 */
export default function HouseRulesPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <Eyebrow>Charis Intelligence Coworking Space</Eyebrow>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
        House Rules
      </h1>
      <p className="mt-3 text-slate-500">
        Ten golden rules for a productive, respectful, and inspiring workspace — please read
        before your first visit.
      </p>

      <img
        src="/documents/house-rules.png"
        alt="Charis Intelligence Coworking Space — 10 Golden Rules for a productive, respectful, and inspiring workspace"
        className="mt-8 w-full rounded-2xl border border-[var(--color-line)] shadow-sm"
      />
    </div>
  );
}
