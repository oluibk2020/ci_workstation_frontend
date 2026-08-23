import { ROLES } from "./constants";

export function dashboardPathForRole(role) {
  switch (role) {
    case ROLES.MANAGER:
      return "/manager/dashboard";
    case ROLES.ADMIN:
      return "/admin/dashboard";
    case ROLES.CLIENT:
    default:
      return "/client/dashboard";
  }
}
