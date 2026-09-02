import { apiFetch } from "./api";

// Super Admin only. New backend endpoint — see docs/PATCH_NOTES.md. The
// AuditLog table existed all along but nothing wrote to it; this session
// also instrumented ban/unban, role changes, cash-funding credits, and
// verification approve/reject to actually log here.
export const auditLogService = {
  list: ({ page, limit, action, entityType } = {}) => {
    const params = new URLSearchParams({
      ...(page && { page }),
      ...(limit && { limit }),
      ...(action && { action }),
      ...(entityType && { entityType }),
    }).toString();
    return apiFetch(`/admin/audit-logs${params ? `?${params}` : ""}`);
  },
};
