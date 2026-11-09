import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useNotificationStore = create(
  devtools((set) => ({
    notifications: [],

    addNotification: (notification) =>
      set((state) => ({
        notifications: [...state.notifications, notification],
      })),

    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),

    clearNotifications: () => set({ notifications: [] }),
  }))
);
