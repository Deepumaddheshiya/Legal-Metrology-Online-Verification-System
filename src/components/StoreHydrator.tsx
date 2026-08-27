"use client";

import { useEffect } from "react";
import { useMockStore } from "@/lib/mockStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";

/**
 * Rehydrates the client-side mock stores from localStorage AFTER the first
 * render. The persist middleware is configured with `skipHydration`, so the
 * server-rendered (SSR) HTML and the first client render both use the default
 * state, eliminating React hydration mismatches when a persisted (different)
 * user/role is present in localStorage.
 */
export function StoreHydrator() {
  useEffect(() => {
    useMockStore.persist.rehydrate();
    // Auth store mirrors mock store state; re-sync it after rehydration.
    useAuthStore.setState({
      currentUser: useMockStore.getState().currentUser,
      isAuthenticated: Boolean(useMockStore.getState().currentUser),
      isDemoMode: false,
    });
    useNotificationStore.getState().fetchNotifications();
  }, []);

  return null;
}
