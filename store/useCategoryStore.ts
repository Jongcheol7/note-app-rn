import { create } from 'zustand';

interface CategoryState {
  categoryName: string;
  setCategoryName: (value: string) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categoryName: '',
  setCategoryName: (value: string) => set({ categoryName: value }),
}));
