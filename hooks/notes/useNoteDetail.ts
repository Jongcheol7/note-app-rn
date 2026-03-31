import { useQuery } from '@tanstack/react-query';
import { fetchNoteDetail } from '@/lib/services/noteService';
import { useFromStore } from '@/store/useFromStore';

export function useNoteDetail(noteNo: number | null) {
  const menuFrom = useFromStore((s) => s.menuFrom);

  return useQuery({
    queryKey: ['noteDetail', noteNo],
    queryFn: () => fetchNoteDetail(noteNo!, menuFrom),
    enabled: !!noteNo,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
