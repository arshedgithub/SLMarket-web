import { create } from "zustand";

// Shared open/close state for the "Browse Categories" modal so it can be
// triggered from more than one place (the navbar button and the homepage
// "View all" link) while the modal itself is rendered once, in Navigation.
interface CategoryModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCategoryModalStore = create<CategoryModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
