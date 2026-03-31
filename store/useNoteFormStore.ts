import { create } from 'zustand';

interface Category {
  id: number;
  name: string;
}

interface NoteFormState {
  noteNo: number | null;
  categories: Category[];
  selectedCategoryNo: number;
  title: string;
  selectedColor: string;
  alarmDatetime: string | null;
  isPublic: boolean;
  isLike: boolean;
  isDirty: boolean;

  setNoteNo: (val: number | null) => void;
  setCategories: (cats: Category[]) => void;
  setSelectedCategoryNo: (no: number) => void;
  setTitle: (val: string) => void;
  setSelectedColor: (val: string) => void;
  setAlarmDatetime: (date: string | null) => void;
  setIsPublic: (val: boolean) => void;
  setIsLike: (val: boolean) => void;
  setIsDirty: (val: boolean) => void;
  reset: () => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: -2, name: '➕ 추가' },
  { id: -1, name: '분류되지 않음' },
];

export const useNoteFormStore = create<NoteFormState>((set) => ({
  noteNo: null,
  categories: [...DEFAULT_CATEGORIES],
  selectedCategoryNo: -1,
  title: '',
  selectedColor: '#FEF3C7',
  alarmDatetime: null,
  isPublic: false,
  isLike: false,
  isDirty: false,

  setNoteNo: (val) => set({ noteNo: val }),
  setCategories: (cats) =>
    set({ categories: [...DEFAULT_CATEGORIES, ...cats] }),
  setSelectedCategoryNo: (no) => set({ selectedCategoryNo: no }),
  setTitle: (val) => set({ title: val, isDirty: true }),
  setSelectedColor: (val) => set({ selectedColor: val }),
  setAlarmDatetime: (date) => set({ alarmDatetime: date }),
  setIsPublic: (val) => set({ isPublic: val }),
  setIsLike: (val) => set({ isLike: val }),
  setIsDirty: (val) => set({ isDirty: val }),
  reset: () =>
    set({
      noteNo: null,
      categories: [...DEFAULT_CATEGORIES],
      title: '',
      selectedColor: '#FEF3C7',
      alarmDatetime: null,
      isPublic: false,
      isLike: false,
      isDirty: false,
    }),
}));
