import { create } from 'zustand';

interface SearchState {
  keyword: string;
  setKeyword: (value: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  keyword: '',
  setKeyword: (value: string) => set({ keyword: value }),
}));
