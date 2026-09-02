import { apiFetch } from "./api";

// Super Admin only. New backend endpoint — see docs/PATCH_NOTES.md for
// the revenue definition used (BOOKING_DEBIT minus
// BOOKING_CANCELLATION_CREDIT within the given range).
export const reportService = {
  getSummary: ({ startDate, endDate, branchId }) => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      ...(branchId && { branchId }),
    });
    return apiFetch(`/admin/reports/summary?${params}`);
  },
};
