import Eyebrow from "../../components/common/Eyebrow";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <Eyebrow>About Work Station</Eyebrow>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
        We sell the boring stuff that makes work possible
      </h1>
      <div className="mt-6 space-y-4 text-slate-600 leading-relaxed">
        <p>
          Work Station started with a simple observation: developers don't need someone else's
          computer — they need a desk that doesn't lose power halfway through a deploy, and internet
          that doesn't buckle under a video call.
        </p>
        <p>
          Every location we run is built around three things: a reliable socket, a dedicated internet
          line, and a door that locks. Bring your own laptop, book by the day, and check in with a QR
          code — the rest is just infrastructure, working quietly in the background.
        </p>
        <p>
          We're currently operating in Sagamu and Lekki, with more locations planned as demand grows.
        </p>
      </div>
    </div>
  );
}
