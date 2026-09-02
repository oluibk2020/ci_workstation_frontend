import { apiFetch } from "./api";

// Confirmed real endpoints, fully implemented and correctly wired
// (req.user.id bug already fixed — see docs/PATCH_NOTES.md).
export const notificationService = {
  list: ({ unreadOnly, page, limit } = {}) =>
    apiFetch(
      `/notifications?${new URLSearchParams({
        ...(unreadOnly && { unreadOnly: "true" }),
        ...(page && { page }),
        ...(limit && { limit }),
      })}`
    ),
  get: (notificationId) => apiFetch(`/notifications/${notificationId}`),
  markAsRead: (notificationId) => apiFetch(`/notifications/${notificationId}/read`, { method: "PATCH" }),
  markAllAsRead: () => apiFetch("/notifications/read-all", { method: "PATCH" }),
};
