import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchNoteHistory,
  restoreFromHistory,
  deleteHistory,
} from '@/lib/services/historyService';

export function useNoteHistory(noteNo: number | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['noteHistory', noteNo],
    queryFn: () => fetchNoteHistory(noteNo!, user!.id),
    enabled: !!noteNo && !!user,
  });
}

export function useRestoreHistory(noteNo: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      historyNo,
      currentTitle,
      currentContent,
      currentPlainText,
    }: {
      historyNo: number;
      currentTitle: string;
      currentContent: string;
      currentPlainText: string;
    }) =>
      restoreFromHistory(
        historyNo,
        noteNo,
        user!.id,
        currentTitle,
        currentContent,
        currentPlainText
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noteDetail', noteNo] });
      queryClient.invalidateQueries({ queryKey: ['noteHistory', noteNo] });
      queryClient.invalidateQueries({ queryKey: ['noteLists'] });
    },
  });
}

export function useDeleteHistory(noteNo: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (historyNo: number) => deleteHistory(historyNo, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noteHistory', noteNo] });
    },
  });
}
