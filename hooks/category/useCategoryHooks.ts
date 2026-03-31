import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  reorderCategories,
} from '@/lib/services/categoryService';

export function useCategoryList() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(user!.id),
    enabled: !!user,
  });
}

export function useCreateCategory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createCategory(name, user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryNo: number) => deleteCategory(categoryNo, user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useReorderCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { categoryNo: number; sortOrder: number }[]) =>
      reorderCategories(items, user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}
