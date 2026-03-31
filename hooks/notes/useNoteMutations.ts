import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { useAuth } from '@/lib/AuthContext';
import {
  saveNote,
  softDeleteNote,
  hardDeleteNote,
  recoverNote,
  togglePinNote,
  changeNoteColor,
  toggleNotePublic,
  toggleLike,
} from '@/lib/services/noteService';

export function useSaveNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      noteNo?: number | null;
      title: string;
      content: string;
      plainText: string;
      categoryNo?: number | null;
      color?: string | null;
      isPublic?: boolean;
      alarmDatetime?: string | null;
    }) => saveNote({ ...params, userId: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noteLists'] });
      queryClient.invalidateQueries({ queryKey: ['noteDetail'] });
    },
  });
}

export function useSoftDeleteNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteNo: number) => softDeleteNote(noteNo, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noteLists'] });
    },
  });
}

export function useHardDeleteNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteNo: number) => hardDeleteNote(noteNo, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noteLists'] });
    },
  });
}

export function useRecoverNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteNo: number) => recoverNote(noteNo, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noteLists'] });
    },
  });
}

export function useTogglePin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteNo, isPinned }: { noteNo: number; isPinned: boolean }) =>
      togglePinNote(noteNo, isPinned, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noteLists'] });
    },
  });
}

export function useChangeColor() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteNo, color }: { noteNo: number; color: string }) =>
      changeNoteColor(noteNo, color, user!.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['noteLists'] });
      queryClient.invalidateQueries({
        queryKey: ['noteDetail', variables.noteNo],
      });
    },
  });
}

export function useTogglePublic() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteNo,
      isPublic,
    }: {
      noteNo: number;
      isPublic: boolean;
    }) => toggleNotePublic(noteNo, isPublic, user!.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['noteLists'] });
      queryClient.invalidateQueries({
        queryKey: ['noteDetail', variables.noteNo],
      });
    },
  });
}

export function useToggleLike() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteNo,
      isLike,
    }: {
      noteNo: number;
      isLike: boolean;
    }) => toggleLike(noteNo, isLike, user!.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['noteLists'] });
      queryClient.invalidateQueries({
        queryKey: ['noteDetail', variables.noteNo],
      });
    },
  });
}
