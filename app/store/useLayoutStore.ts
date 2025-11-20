import { create } from "zustand";

interface LayoutStore {
    isNavbarVisible: boolean;
    setNavbarVisible: (visible: boolean) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
    isNavbarVisible: true,
    setNavbarVisible: (visible) => set({ isNavbarVisible: visible }),
}));
