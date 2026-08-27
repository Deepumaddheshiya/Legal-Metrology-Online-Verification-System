import { create } from "zustand";
import { User, UserRole } from "@/types";
import { useMockStore } from "@/lib/mockStore";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  init: () => Promise<void>;
  setUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: useMockStore.getState().currentUser,
  isAuthenticated: true,
  isLoading: false,
  isDemoMode: false,

  init: async () => {
    const user = useMockStore.getState().currentUser;
    set({
      currentUser: user,
      isAuthenticated: Boolean(user),
      isLoading: false,
      isDemoMode: false,
    });
  },

  setUser: (user: User) => {
    useMockStore.getState().setUser(user);
    set({ currentUser: user, isAuthenticated: true, isDemoMode: false });
  },

  switchRole: (role: UserRole) => {
    useMockStore.getState().switchRole(role);
    const updated = useMockStore.getState().currentUser;
    set({ currentUser: updated, isAuthenticated: true, isDemoMode: true });
  },

  logout: async () => {
    useMockStore.getState().logout();
    set({ currentUser: null, isAuthenticated: false, isDemoMode: false });
  },
}));

// Synchronize useMockStore state updates to useAuthStore
useMockStore.subscribe((state) => {
  useAuthStore.setState({
    currentUser: state.currentUser,
    isAuthenticated: Boolean(state.currentUser),
  });
});
