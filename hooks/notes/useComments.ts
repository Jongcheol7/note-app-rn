import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
} from '@/lib/services/commentService';

export function useComments(noteNo: number | null) {
  return useQuery({
    queryKey: ['comments', noteNo],
    queryFn: () => fetchComments(noteNo!),
    enabled: !!noteNo,
  });
}

export function useCreateComment(noteNo: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => createComment(noteNo, content, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', noteNo] });
      queryClient.invalidateQueries({ queryKey: ['noteDetail', noteNo] });
    },
  });
}

export function useUpdateComment(noteNo: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentNo, content }: { commentNo: number; content: string }) =>
      updateComment(commentNo, content, user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', noteNo] }),
  });
}

export function useDeleteComment(noteNo: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentNo: number) => deleteComment(commentNo, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', noteNo] });
      queryClient.invalidateQueries({ queryKey: ['noteDetail', noteNo] });
    },
  });
}
