import { createContext, useContext, useState, useCallback } from "react";
import { SEAT_STATUS } from "../utils/constants";

/**
 * CatalogContext
 * --------------
 * Models the backend's real hierarchy: Platform → Branch → Workstation →
 * Seat (see docs/BACKEND_ALIGNMENT.md §2). A Workstation is a type/category
 * belonging to one branch and holds the daily price (e.g. "Standing Desk,
 * Sagamu, ₦8,000/day"). A Seat is the actual bookable unit — an individual
 * physical instance of that workstation type, holding status and physical
 * specs (monitor, power, internet). Multiple identical seats can share one
 * workstation type and its price.
 *
 * Branch also carries operating hours, a timezone, and operating days —
 * confirmed by the Testing/Deployment/Maintenance Guide §9/§24. The
 * backend uses these to run automatic checkout at each branch's closing
 * time (in its own timezone), independent of other branches.
 *
 * Branch creation is restricted to Super Admin at the UI level (only
 * rendered on /admin routes) — the backend must independently enforce this
 * once it exists; this context does not perform that check.
 *
 * Mocked as in-memory state. CRUD function shapes (add/update/remove) are
 * designed to map 1:1 onto future branchService/workstationService/
 * seatService calls — swapping mocked state for real API calls is the only
 * change needed later.
 */

const CatalogContext = createContext(null);

let idCounter = 100;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

const INITIAL_BRANCHES = [
  {
    id: "branch-1",
    name: "Sagamu",
    address: "Akarigbo Road, Sagamu, Ogun State",
    timezone: "Africa/Lagos",
    openTime: "08:00",
    closeTime: "20:00",
    operatingDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
    createdAt: "2026-06-01",
  },
  {
    id: "branch-2",
    name: "Lekki",
    address: "Admiralty Way, Lekki Phase 1, Lagos",
    timezone: "Africa/Lagos",
    openTime: "08:00",
    closeTime: "20:00",
    operatingDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
    createdAt: "2026-07-10",
  },
];

const INITIAL_WORKSTATIONS = [
  { id: "wk-1", branchId: "branch-1", name: "Standing Desk", dailyRate: 8000 },
  { id: "wk-2", branchId: "branch-1", name: "Shared Bench", dailyRate: 6000 },
  { id: "wk-3", branchId: "branch-1", name: "Quiet Booth", dailyRate: 9000 },
  { id: "wk-4", branchId: "branch-2", name: "Quiet Booth", dailyRate: 9500 },
  { id: "wk-5", branchId: "branch-2", name: "Standing Desk", dailyRate: 7500 },
  { id: "wk-6", branchId: "branch-2", name: "Shared Bench", dailyRate: 6500 },
];

const INITIAL_SEATS = [
  { id: "seat-1", workstationId: "wk-1", code: "WS-01", externalMonitor: true, powerOutlets: 2, internetMbps: 500, status: SEAT_STATUS.AVAILABLE },
  { id: "seat-2", workstationId: "wk-2", code: "WS-02", externalMonitor: false, powerOutlets: 1, internetMbps: 300, status: SEAT_STATUS.AVAILABLE },
  { id: "seat-3", workstationId: "wk-3", code: "WS-03", externalMonitor: true, powerOutlets: 2, internetMbps: 500, status: SEAT_STATUS.OCCUPIED },
  { id: "seat-4", workstationId: "wk-4", code: "WS-11", externalMonitor: true, powerOutlets: 2, internetMbps: 500, status: SEAT_STATUS.AVAILABLE },
  { id: "seat-5", workstationId: "wk-5", code: "WS-12", externalMonitor: false, powerOutlets: 2, internetMbps: 300, status: SEAT_STATUS.MAINTENANCE },
  { id: "seat-6", workstationId: "wk-6", code: "WS-13", externalMonitor: false, powerOutlets: 1, internetMbps: 300, status: SEAT_STATUS.AVAILABLE },
];

export function CatalogProvider({ children }) {
  const [branches, setBranches] = useState(INITIAL_BRANCHES);
  const [workstations, setWorkstations] = useState(INITIAL_WORKSTATIONS);
  const [seats, setSeats] = useState(INITIAL_SEATS);

  // ---------- Branches ----------
  const addBranch = useCallback((data) => {
    const branch = { id: nextId("branch"), createdAt: new Date().toISOString().slice(0, 10), ...data };
    setBranches((prev) => [...prev, branch]);
    return branch;
  }, []);

  const updateBranch = useCallback((id, data) => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
  }, []);

  const removeBranch = useCallback(
    (id) => {
      const inUse = workstations.some((wk) => wk.branchId === id);
      if (inUse) {
        return { ok: false, reason: "This branch still has workstation types assigned to it." };
      }
      setBranches((prev) => prev.filter((b) => b.id !== id));
      return { ok: true };
    },
    [workstations]
  );

  // ---------- Workstations (type/category, holds price) ----------
  const addWorkstation = useCallback((data) => {
    const workstation = { id: nextId("wk"), ...data };
    setWorkstations((prev) => [...prev, workstation]);
    return workstation;
  }, []);

  const updateWorkstation = useCallback((id, data) => {
    setWorkstations((prev) => prev.map((wk) => (wk.id === id ? { ...wk, ...data } : wk)));
  }, []);

  const removeWorkstation = useCallback(
    (id) => {
      const inUse = seats.some((seat) => seat.workstationId === id);
      if (inUse) {
        return { ok: false, reason: "This workstation type still has seats assigned to it." };
      }
      setWorkstations((prev) => prev.filter((wk) => wk.id !== id));
      return { ok: true };
    },
    [seats]
  );

  // ---------- Seats (the bookable unit, holds status + physical specs) ----------
  const addSeat = useCallback((data) => {
    const seat = { id: nextId("seat"), status: SEAT_STATUS.AVAILABLE, ...data };
    setSeats((prev) => [...prev, seat]);
    return seat;
  }, []);

  const updateSeat = useCallback((id, data) => {
    setSeats((prev) => prev.map((seat) => (seat.id === id ? { ...seat, ...data } : seat)));
  }, []);

  const updateSeatStatus = useCallback((id, status) => {
    setSeats((prev) => prev.map((seat) => (seat.id === id ? { ...seat, status } : seat)));
  }, []);

  const removeSeat = useCallback((id) => {
    setSeats((prev) => prev.filter((seat) => seat.id !== id));
  }, []);

  // ---------- Lookups ----------
  const getBranchName = useCallback((branchId) => branches.find((b) => b.id === branchId)?.name || "Unknown", [branches]);
  const getWorkstation = useCallback((workstationId) => workstations.find((wk) => wk.id === workstationId), [workstations]);
  const getWorkstationsForBranch = useCallback(
    (branchId) => workstations.filter((wk) => wk.branchId === branchId),
    [workstations]
  );
  const getSeatsForWorkstation = useCallback(
    (workstationId) => seats.filter((seat) => seat.workstationId === workstationId),
    [seats]
  );

  // Convenience: a fully joined seat, for catalog display (public site,
  // admin/staff seat lists) without every consumer re-deriving the joins.
  const seatsWithDetails = seats.map((seat) => {
    const workstation = getWorkstation(seat.workstationId);
    return {
      ...seat,
      workstationName: workstation?.name || "Unknown",
      dailyRate: workstation?.dailyRate ?? 0,
      branchId: workstation?.branchId,
      branchName: getBranchName(workstation?.branchId),
    };
  });

  const value = {
    branches,
    workstations,
    seats,
    seatsWithDetails,
    addBranch,
    updateBranch,
    removeBranch,
    addWorkstation,
    updateWorkstation,
    removeWorkstation,
    addSeat,
    updateSeat,
    updateSeatStatus,
    removeSeat,
    getBranchName,
    getWorkstation,
    getWorkstationsForBranch,
    getSeatsForWorkstation,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within a CatalogProvider");
  return ctx;
}
