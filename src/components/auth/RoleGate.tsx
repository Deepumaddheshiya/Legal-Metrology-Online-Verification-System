"use client";

import React, { ReactNode } from "react";
import { UserRole, isRoleAllowed } from "@/lib/rbac";
import { useAuthStore } from "@/stores/useAuthStore";
import { ShieldAlert } from "lucide-react";

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  showDefaultAccessDenied?: boolean;
}

export function RoleGate({
  allowedRoles,
  children,
  fallback,
  showDefaultAccessDenied = false,
}: RoleGateProps) {
  const { currentUser, isLoading } = useAuthStore();
  const userRole = (currentUser?.role as UserRole) || "public";

  // While the session is still loading, render nothing rather than flashing a
  // false "Access Restricted" for an unauthenticated-looking (null) user.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Verifying authorization…
      </div>
    );
  }

  const hasAccess = isRoleAllowed(userRole, allowedRoles);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showDefaultAccessDenied) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-lg font-semibold text-red-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-red-700">
            Your current role (<span className="font-semibold uppercase">{userRole}</span>) does not have authorization to view or manage this section.
          </p>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}
