import { create } from 'zustand';

interface FromState {
  menuFrom: string;
  setMenuFrom: (value: string) => void;
}

export const useFromStore = create<FromState>((set) => ({
  menuFrom: '',
  setMenuFrom: (value: string) => set({ menuFrom: value }),
}));
