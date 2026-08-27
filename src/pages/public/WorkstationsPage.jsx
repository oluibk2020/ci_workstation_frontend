import { Link } from "react-router-dom";
import Eyebrow from "../../components/common/Eyebrow";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { useCatalog } from "../../context/CatalogContext";
import { SEAT_STATUS } from "../../utils/constants";

export default function WorkstationsPage() {
  const { seatsWithDetails } = useCatalog();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <Eyebrow>Workstation catalog</Eyebrow>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
        Browse seats by branch
      </h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        Every listing describes the desk type, seating, power and internet available at that seat —
        bring your own laptop or computer to use there.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {seatsWithDetails.map((seat) => (
          <div key={seat.id} className="flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono-tight text-xs font-semibold uppercase tracking-wide text-slate-400">
                {seat.code} · {seat.branchName}
              </p>
              <Badge status={seat.status} />
            </div>
            <p className="mt-3 text-lg font-semibold text-[var(--color-primary)]">{seat.workstationName}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-500">
              <li>External monitor: {seat.externalMonitor ? "Available" : "Not available"}</li>
              <li>Power: {seat.powerOutlets} outlet{seat.powerOutlets === 1 ? "" : "s"} · UPS backup</li>
              <li>Internet: {seat.internetMbps} Mbps dedicated</li>
            </ul>
            <div className="mt-5 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
              <p className="font-mono-tight text-lg font-bold text-[var(--color-primary)]">
                ₦{seat.dailyRate.toLocaleString()}/day
              </p>
              <Button as={Link} to="/register" size="sm" disabled={seat.status !== SEAT_STATUS.AVAILABLE}>
                Book now
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
