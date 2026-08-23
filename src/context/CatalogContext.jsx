import { createContext, useContext, useState, useCallback } from "react";
import { WORKSTATION_STATUS } from "../utils/constants";

/**
 * CatalogContext
 * --------------
 * Holds Locations and Workstations as in-memory mock data (see docs Section
 * 18 for the real data model). This is the Phase 2 stand-in for
 * locationService.js / workstationService.js hitting a real Prisma-backed
 * API — the shape of the CRUD functions here (add/update/remove) is
 * designed to map 1:1 onto future service calls, so swapping the body of
 * each function for a real fetch is the only change needed later.
 *
 * Location creation is restricted to Admin at the UI level (only rendered
 * on /admin routes) — per docs Section 17, the backend must independently
 * enforce this once it exists; this context does not perform that check.
 */

const CatalogContext = createContext(null);

let idCounter = 100;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

const INITIAL_LOCATIONS = [
  {
    id: "loc-1",
    name: "Sagamu",
    address: "Akarigbo Road, Sagamu, Ogun State",
    dailyRateDefault: 6000,
    createdAt: "2026-06-01",
  },
  {
    id: "loc-2",
    name: "Lekki",
    address: "Admiralty Way, Lekki Phase 1, Lagos",
    dailyRateDefault: 6500,
    createdAt: "2026-07-10",
  },
];

const INITIAL_WORKSTATIONS = [
  { id: "ws-1", code: "WS-01", locationId: "loc-1", deskType: "Standing Desk", seating: "Ergonomic Chair", externalMonitor: true, powerOutlets: 2, internetMbps: 500, dailyRate: 8000, status: WORKSTATION_STATUS.AVAILABLE },
  { id: "ws-2", code: "WS-02", locationId: "loc-1", deskType: "Shared Bench", seating: "Standard Chair", externalMonitor: false, powerOutlets: 1, internetMbps: 300, dailyRate: 6000, status: WORKSTATION_STATUS.AVAILABLE },
  { id: "ws-3", code: "WS-03", locationId: "loc-1", deskType: "Quiet Booth", seating: "Ergonomic Chair", externalMonitor: true, powerOutlets: 2, internetMbps: 500, dailyRate: 9000, status: WORKSTATION_STATUS.OCCUPIED },
  { id: "ws-4", code: "WS-11", locationId: "loc-2", deskType: "Quiet Booth", seating: "Ergonomic Chair", externalMonitor: true, powerOutlets: 2, internetMbps: 500, dailyRate: 9500, status: WORKSTATION_STATUS.AVAILABLE },
  { id: "ws-5", code: "WS-12", locationId: "loc-2", deskType: "Standing Desk", seating: "Ergonomic Chair", externalMonitor: false, powerOutlets: 2, internetMbps: 300, dailyRate: 7500, status: WORKSTATION_STATUS.MAINTENANCE },
  { id: "ws-6", code: "WS-13", locationId: "loc-2", deskType: "Shared Bench", seating: "Standard Chair", externalMonitor: false, powerOutlets: 1, internetMbps: 300, dailyRate: 6500, status: WORKSTATION_STATUS.AVAILABLE },
];

export function CatalogProvider({ children }) {
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [workstations, setWorkstations] = useState(INITIAL_WORKSTATIONS);

  const addLocation = useCallback((data) => {
    const location = { id: nextId("loc"), createdAt: new Date().toISOString().slice(0, 10), ...data };
    setLocations((prev) => [...prev, location]);
    return location;
  }, []);

  const updateLocation = useCallback((id, data) => {
    setLocations((prev) => prev.map((loc) => (loc.id === id ? { ...loc, ...data } : loc)));
  }, []);

  const removeLocation = useCallback(
    (id) => {
      const inUse = workstations.some((ws) => ws.locationId === id);
      if (inUse) {
        return { ok: false, reason: "This location still has workstations assigned to it." };
      }
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
      return { ok: true };
    },
    [workstations]
  );

  const addWorkstation = useCallback((data) => {
    const workstation = { id: nextId("ws"), status: WORKSTATION_STATUS.AVAILABLE, ...data };
    setWorkstations((prev) => [...prev, workstation]);
    return workstation;
  }, []);

  const updateWorkstation = useCallback((id, data) => {
    setWorkstations((prev) => prev.map((ws) => (ws.id === id ? { ...ws, ...data } : ws)));
  }, []);

  const updateWorkstationStatus = useCallback((id, status) => {
    setWorkstations((prev) => prev.map((ws) => (ws.id === id ? { ...ws, status } : ws)));
  }, []);

  const removeWorkstation = useCallback((id) => {
    setWorkstations((prev) => prev.filter((ws) => ws.id !== id));
  }, []);

  const getLocationName = useCallback(
    (locationId) => locations.find((l) => l.id === locationId)?.name || "Unknown",
    [locations]
  );

  const value = {
    locations,
    workstations,
    addLocation,
    updateLocation,
    removeLocation,
    addWorkstation,
    updateWorkstation,
    updateWorkstationStatus,
    removeWorkstation,
    getLocationName,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within a CatalogProvider");
  return ctx;
}
