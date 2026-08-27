import { create } from "zustand";
import { NotificationItem } from "@/types";
import { useMockStore } from "@/lib/mockStore";

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<NotificationItem, "id" | "createdAt" | "isRead">) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: useMockStore.getState().notifications,
  unreadCount: useMockStore.getState().notifications.filter((n) => !n.isRead).length,
  isLoading: false,

  fetchNotifications: async () => {
    const list = useMockStore.getState().notifications;
    set({
      notifications: list,
      unreadCount: list.filter((n) => !n.isRead).length,
      isLoading: false,
    });
  },

  markAsRead: async (id: string) => {
    useMockStore.getState().markNotificationRead(id);
    const list = useMockStore.getState().notifications;
    set({
      notifications: list,
      unreadCount: list.filter((n) => !n.isRead).length,
    });
  },

  markAllAsRead: async () => {
    useMockStore.getState().markAllNotificationsRead();
    const list = useMockStore.getState().notifications;
    set({
      notifications: list,
      unreadCount: 0,
    });
  },

  addNotification: (item) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    useMockStore.setState((s) => ({
      notifications: [newNotif, ...s.notifications],
    }));
    const list = useMockStore.getState().notifications;
    set({
      notifications: list,
      unreadCount: list.filter((n) => !n.isRead).length,
    });
  },
}));

useMockStore.subscribe((state) => {
  useNotificationStore.setState({
    notifications: state.notifications,
    unreadCount: state.notifications.filter((n) => !n.isRead).length,
  });
});
