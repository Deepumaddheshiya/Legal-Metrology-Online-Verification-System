// Role-Based Access Control (RBAC) & Jurisdictional Scope Engine

export type UserRole =
  | "super_admin"
  | "state_admin"
  | "lmo"
  | "gatc"
  | "business_owner"
  | "public";

export interface RoutePermission {
  pattern: RegExp;
  allowedRoles: UserRole[];
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Super Admin only routes
  { pattern: /^\/dashboard\/admin(\/.*)?$/, allowedRoles: ["super_admin"] },
  { pattern: /^\/dashboard\/audit-logs(\/.*)?$/, allowedRoles: ["super_admin"] },

  // State Admin & Super Admin routes
  { pattern: /^\/dashboard\/state-admin(\/.*)?$/, allowedRoles: ["super_admin", "state_admin"] },
  { pattern: /^\/dashboard\/master-data(\/.*)?$/, allowedRoles: ["super_admin", "state_admin"] },

  // LMO & GATC Verification & Inspection routes
  { pattern: /^\/dashboard\/lmo(\/.*)?$/, allowedRoles: ["super_admin", "lmo", "gatc"] },

  // GATC routes
  { pattern: /^\/dashboard\/gatc(\/.*)?$/, allowedRoles: ["super_admin", "gatc"] },

  // Application Creation (Only Business Owners submit new applications)
  { pattern: /^\/dashboard\/applications\/new$/, allowedRoles: ["business_owner"] },

  // All other dashboard routes (applications, certificates, instruments, profile, reports, search)
  {
    pattern: /^\/dashboard(\/.*)?$/,
    allowedRoles: ["super_admin", "state_admin", "lmo", "gatc", "business_owner"],
  },
];

export function isRoleAllowed(userRole: string, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole as UserRole);
}

export function canAccessRoute(userRole: string, pathname: string): boolean {
  // Public routes always accessible
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/complaints") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/api/certificates/verify") ||
    pathname.startsWith("/api/cron")
  ) {
    return true;
  }

  // Match against route permissions table
  for (const perm of ROUTE_PERMISSIONS) {
    if (perm.pattern.test(pathname)) {
      return isRoleAllowed(userRole, perm.allowedRoles);
    }
  }

  return true;
}

export function getRoleDefaultDashboard(role: string): string {
  switch (role) {
    case "super_admin":
      return "/dashboard";
    case "state_admin":
      return "/dashboard";
    case "lmo":
      return "/dashboard/lmo/schedule";
    case "gatc":
      return "/dashboard";
    case "business_owner":
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

// Jurisdictional Access Control Helper
export interface JurisdictionContext {
  userRole: string;
  userStateId?: string | null;
  userDistrict?: string | null;
  resourceStateId?: string | null;
  resourceDistrict?: string | null;
}

export function validateJurisdiction(context: JurisdictionContext): {
  hasAccess: boolean;
  reason?: string;
} {
  const { userRole, userStateId, resourceStateId } = context;

  // 1. Super Admin has unrestricted national jurisdiction across all states
  if (userRole === "super_admin") {
    return { hasAccess: true };
  }

  // 2. State Admin must match stateId of resource
  if (userRole === "state_admin") {
    if (!resourceStateId || !userStateId || userStateId !== resourceStateId) {
      return {
        hasAccess: false,
        reason: "Access denied: Resource is outside your state jurisdiction",
      };
    }
    return { hasAccess: true };
  }

  // 3. LMO & GATC must match state jurisdiction
  if (userRole === "lmo" || userRole === "gatc") {
    if (resourceStateId && userStateId && userStateId !== resourceStateId) {
      return {
        hasAccess: false,
        reason: "Access denied: Officer not authorized for this jurisdiction",
      };
    }
    return { hasAccess: true };
  }

  // 4. Business Owner: checked via businessId ownership
  return { hasAccess: true };
}
