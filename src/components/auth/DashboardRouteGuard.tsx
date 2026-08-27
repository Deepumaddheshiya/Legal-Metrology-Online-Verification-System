"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { ROUTE_PERMISSIONS, UserRole } from "@/lib/rbac";
import { RoleGate } from "./RoleGate";

/**
 * Client-side defense-in-depth that mirrors the server middleware RBAC.
 *
 * It resolves the allowed roles for the current path from the same
 * ROUTE_PERMISSIONS engine used by middleware, then delegates the actual
 * allow/deny decision to <RoleGate>. This ensures that even if middleware is
 * bypassed, a role-inappropriate page renders an "Access Restricted" panel
 * instead of potentially leaking data the API may have returned.
 */
export function DashboardRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, isLoading } = useAuthStore();

  // Resolve the matching route permission (first match, like middleware).
  const matched = ROUTE_PERMISSIONS.find((p) => p.pattern.test(pathname));
  const allowedRoles: UserRole[] = matched ? matched.allowedRoles : [];

  // Public routes (or unmatched) are not gated here.
  if (!matched) {
    return <>{children}</>;
  }

  // While loading we still let RoleGate show its loader.
  if (isLoading) {
    return <RoleGate allowedRoles={allowedRoles}>{children}</RoleGate>;
  }

  const userRole = (currentUser?.role as UserRole) || "public";
  const isAllowed = allowedRoles.includes(userRole);

  // Unauthenticated users on a role-gated route should not see a confusing
  // "Access Restricted (role: public)"; the (dashboard)/layout + middleware
  // will redirect them. Render children and let middleware handle the redirect.
  if (!currentUser) {
    return <>{children}</>;
  }

  if (!isAllowed) {
    return (
      <RoleGate allowedRoles={allowedRoles} showDefaultAccessDenied>
        {children}
      </RoleGate>
    );
  }

  return <>{children}</>;
}
