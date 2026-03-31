import { create } from 'zustand';

interface ColorState {
  color: string;
  setColor: (value: string) => void;
  initColor: () => void;
}

export const useColorStore = create<ColorState>((set) => ({
  color: '',
  setColor: (value: string) => set({ color: value }),
  initColor: () => set({ color: '' }),
}));
