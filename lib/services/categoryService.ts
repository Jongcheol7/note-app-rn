import { supabase } from '../supabase';

export async function fetchCategories(userId: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('category')
    .select('categoryNo, name, sortOrder')
    .eq('userId', userId)
    .order('sortOrder');
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(name: string, userId: string) {
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from('category')
    .select('categoryNo')
    .eq('userId', userId)
    .eq('name', name)
    .single();

  if (existing) throw new Error('이미 존재하는 카테고리입니다.');

  const { data: maxData } = await supabase
    .from('category')
    .select('sortOrder')
    .eq('userId', userId)
    .order('sortOrder', { ascending: false })
    .limit(1)
    .single();

  const sortOrder = (maxData?.sortOrder ?? 0) + 1;

  const { data, error } = await supabase
    .from('category')
    .insert({ name, userId, sortOrder })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(categoryNo: number, userId: string) {
  if (!supabase) return;
  const { error } = await supabase
    .from('category')
    .delete()
    .eq('categoryNo', categoryNo)
    .eq('userId', userId);
  if (error) throw error;
}

export async function reorderCategories(
  items: { categoryNo: number; sortOrder: number }[],
  userId: string
) {
  if (!supabase) return;
  await Promise.all(
    items.map((item) =>
      supabase
        .from('category')
        .update({ sortOrder: item.sortOrder })
        .eq('categoryNo', item.categoryNo)
        .eq('userId', userId)
    )
  );
}
