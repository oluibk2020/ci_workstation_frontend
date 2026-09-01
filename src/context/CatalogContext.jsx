import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { branchService } from "../services/branchService";
import { workstationService } from "../services/workstationService";
import { seatService } from "../services/seatService";

/**
 * CatalogContext
 * --------------
 * Wired to the real backend (docs/PATCH_NOTES.md — confirmed running).
 *
 * IMPORTANT CORRECTION to an earlier assumption here: seat endpoints are
 * NOT public. `routes/seatRoute.js` applies `auth` to both
 * GET /seats/workstation/:workstationId and GET /seats/:seatId — only
 * Branches and Workstations are genuinely public reads. Fetching seats
 * while logged out gets a 401. Rather than let that 401 corrupt the whole
 * catalog's error state (branches/workstations would still be fine),
 * seats are loaded separately and only attempted while authenticated —
 * and re-fetched automatically the moment someone logs in, without
 * needing a page refresh.
 *
 * Admin mutations call the real endpoints that exist; the ones that don't
 * are simply not exposed to the UI:
 * - Branches: only CREATE exists on the backend (POST /admin/branches).
 *   No update, no delete, no status route anywhere. `updateBranch` and
 *   `removeBranch` are NOT provided — AdminBranchesPage only offers
 *   create + list.
 * - Workstations: create, update, and status-update all exist. No delete.
 * - Seats: create, update, and status-update all exist. No delete.
 *
 * This isn't a frontend limitation — it's a real gap in their current API
 * (see docs/BACKEND_CODE_REVIEW.md). Nothing here should silently pretend
 * a capability exists that the backend doesn't have.
 */

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [branches, setBranches] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [seats, setSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [seatsRequireAuth, setSeatsRequireAuth] = useState(false);

  // Branches + Workstations: genuinely public, loaded once regardless of
  // auth state.
  const loadPublicCatalog = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const { branches: branchList } = await branchService.list();
      setBranches(branchList);

      const workstationLists = await Promise.all(
        branchList.map((b) => workstationService.listByBranch(b.id).then((r) => r.workstations))
      );
      // Prisma serializes Decimal fields (pricePerDay) as strings over
      // JSON — normalize to Number once here so every consumer downstream
      // can safely call .toLocaleString() etc.
      const allWorkstations = workstationLists.flat().map((wk) => ({ ...wk, pricePerDay: Number(wk.pricePerDay) }));
      setWorkstations(allWorkstations);
    } catch (err) {
      setError(err.message || "Couldn't load the catalog.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Seats: requires auth on the real backend. Only attempted while logged
  // in; re-runs automatically when auth state changes (e.g. login).
  const loadSeats = useCallback(async (workstationList) => {
    if (!isAuthenticated || workstationList.length === 0) {
      setSeats([]);
      setSeatsRequireAuth(!isAuthenticated);
      return;
    }
    setSeatsRequireAuth(false);
    try {
      const seatLists = await Promise.all(
        workstationList.map((wk) => seatService.listByWorkstation(wk.id).then((r) => r.seats))
      );
      setSeats(seatLists.flat());
    } catch (err) {
      // A seat-fetch failure shouldn't take down the whole catalog view —
      // branches/workstations are still valid and already rendered.
      console.error("Couldn't load seats:", err.message);
      setSeats([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadPublicCatalog();
  }, [loadPublicCatalog]);

  useEffect(() => {
    loadSeats(workstations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, workstations.length]);

  const reload = useCallback(async () => {
    await loadPublicCatalog();
  }, [loadPublicCatalog]);

  // ---------- Branches (create only — see header note) ----------
  const addBranch = useCallback(async (data) => {
    const { branch } = await branchService.create(data);
    setBranches((prev) => [...prev, branch]);
    return branch;
  }, []);

  // ---------- Workstations ----------
  const addWorkstation = useCallback(async (data) => {
    const { branchId, ...rest } = data;
    const { workstation } = await workstationService.create(branchId, rest);
    const normalized = { ...workstation, pricePerDay: Number(workstation.pricePerDay) };
    setWorkstations((prev) => [...prev, normalized]);
    return normalized;
  }, []);

  const updateWorkstation = useCallback(async (id, data) => {
    const { workstation } = await workstationService.update(id, data);
    const normalized = { ...workstation, pricePerDay: Number(workstation.pricePerDay) };
    setWorkstations((prev) => prev.map((wk) => (wk.id === id ? { ...wk, ...normalized } : wk)));
    return normalized;
  }, []);

  // ---------- Seats ----------
  const addSeat = useCallback(async (data) => {
    const { workstationId, ...rest } = data;
    const { seat } = await seatService.create(workstationId, rest);
    setSeats((prev) => [...prev, seat]);
    return seat;
  }, []);

  const updateSeat = useCallback(async (id, data) => {
    const { seat } = await seatService.update(id, data);
    setSeats((prev) => prev.map((s) => (s.id === id ? { ...s, ...seat } : s)));
    return seat;
  }, []);

  const updateSeatStatus = useCallback(async (id, status) => {
    const { seat } = await seatService.updateStatus(id, status);
    setSeats((prev) => prev.map((s) => (s.id === id ? { ...s, ...seat } : s)));
    return seat;
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

  const seatsWithDetails = seats.map((seat) => {
    const workstation = getWorkstation(seat.workstationId);
    return {
      ...seat,
      workstationName: workstation?.name || "Unknown",
      pricePerDay: Number(workstation?.pricePerDay ?? 0),
      branchId: workstation?.branchId,
      branchName: getBranchName(workstation?.branchId),
    };
  });

  const value = {
    branches,
    workstations,
    seats,
    seatsWithDetails,
    isLoading,
    error,
    reload,
    seatsRequireAuth,
    addBranch,
    addWorkstation,
    updateWorkstation,
    addSeat,
    updateSeat,
    updateSeatStatus,
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
