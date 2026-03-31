import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchNotes } from '@/lib/services/noteService';
import { useAuth } from '@/lib/AuthContext';
import { useSearchStore } from '@/store/useSearchStore';
import { useFromStore } from '@/store/useFromStore';
import { useCategoryStore } from '@/store/useCategoryStore';

const VALID_MENU_FROM = ['', 'trash', 'community'];

export function useNoteLists() {
  const { user } = useAuth();
  const keyword = useSearchStore((s) => s.keyword);
  const menuFrom = useFromStore((s) => s.menuFrom);
  const categoryName = useCategoryStore((s) => s.categoryName);

  return useInfiniteQuery({
    queryKey: ['noteLists', keyword, menuFrom, categoryName],
    queryFn: ({ pageParam }) =>
      fetchNotes({
        cursor: pageParam,
        keyword,
        menuFrom,
        categoryName,
        userId: user!.id,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user && VALID_MENU_FROM.includes(menuFrom),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
