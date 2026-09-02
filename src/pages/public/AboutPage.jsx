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
          Every branch we run is built around three things: a reliable socket, a dedicated internet
          line, and a door that locks. Bring your own laptop, book by the day, and check in with a QR
          code — the rest is just infrastructure, working quietly in the background.
        </p>
        <p>
          We're currently operating in Sagamu and Lekki, with more branches planned as demand grows.
        </p>
      </div>

      <div className="mt-12">
        <img
          src="/photos/sagamu-workspace-in-use.jpg"
          alt="A developer working at a partitioned desk in the Sagamu branch"
          className="w-full rounded-2xl object-cover"
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <img
            src="/photos/sagamu-desks.jpg"
            alt="Partitioned desks with privacy dividers at the Sagamu branch"
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
          <img
            src="/photos/sagamu-presentation-room.jpg"
            alt="Presentation screen in the Sagamu branch's meeting space"
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
          <img
            src="/photos/sagamu-meeting-space.jpg"
            alt="Seating and projector setup at the Sagamu branch"
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
        </div>
      </div>
    </div>
  );
}
