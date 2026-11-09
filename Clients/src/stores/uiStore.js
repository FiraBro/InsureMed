import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useUiStore = create(
  devtools((set) => ({
    darkMode: false,
    loading: false,
    modalOpen: false,

    toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    setLoading: (status) => set({ loading: status }),
    openModal: () => set({ modalOpen: true }),
    closeModal: () => set({ modalOpen: false }),
  }))
);
