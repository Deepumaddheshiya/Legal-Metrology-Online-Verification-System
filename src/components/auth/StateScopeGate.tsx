"use client";

import React, { ReactNode } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { validateJurisdiction } from "@/lib/rbac";
import { MapPinOff } from "lucide-react";

interface StateScopeGateProps {
  resourceStateId?: string | null;
  resourceDistrict?: string | null;
  children: ReactNode;
  fallback?: ReactNode;
}

export function StateScopeGate({
  resourceStateId,
  resourceDistrict,
  children,
  fallback,
}: StateScopeGateProps) {
  const { currentUser } = useAuthStore();

  const userRole = currentUser?.role || "public";
  const userStateId = currentUser?.stateId;
  const userDistrict = currentUser?.district;

  const { hasAccess, reason } = validateJurisdiction({
    userRole,
    userStateId,
    userDistrict,
    resourceStateId,
    resourceDistrict,
  });

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <MapPinOff className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-lg font-semibold text-amber-900">Jurisdiction Boundary</h3>
        <p className="mt-1 text-sm text-amber-700">
          {reason || "You do not have jurisdictional clearance to view records outside your assigned territory."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
