import { useInfiniteQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { fetchNotes } from '@/lib/services/noteService';
import { useAuth } from '@/lib/AuthContext';
import { useSearchStore } from '@/store/useSearchStore';
import { useFromStore } from '@/store/useFromStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useOffline } from '@/lib/offline/OfflineProvider';

const VALID_MENU_FROM = ['', 'trash', 'community'];

export function useNoteLists() {
  const { user } = useAuth();
  const keyword = useSearchStore((s) => s.keyword);
  const menuFrom = useFromStore((s) => s.menuFrom);
  const categoryName = useCategoryStore((s) => s.categoryName);
  const { isOnline } = useOffline();

  return useInfiniteQuery({
    queryKey: ['noteLists', keyword, menuFrom, categoryName],
    queryFn: async ({ pageParam }) => {
      // If offline on native, try local cache
      if (!isOnline && Platform.OS !== 'web' && menuFrom !== 'community') {
        try {
          const { getLocalNotes } = await import('@/lib/offline/syncEngine');
          const localNotes = await getLocalNotes(user!.id, {
            keyword: keyword || undefined,
            includeDeleted: menuFrom === 'trash',
          });
          return { notes: localNotes as any[], nextCursor: undefined };
        } catch {
          // Fall through to online fetch
        }
      }

      return fetchNotes({
        cursor: pageParam,
        keyword,
        menuFrom,
        categoryName,
        userId: user!.id,
      });
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user && VALID_MENU_FROM.includes(menuFrom),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
