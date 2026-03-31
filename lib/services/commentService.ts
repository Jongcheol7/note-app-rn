import { supabase } from '../supabase';

export async function fetchComments(noteNo: number) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('comment')
    .select('*, user:userId (id, name, nickname, image, profileImage)')
    .eq('noteNo', noteNo)
    .order('inputDatetime');
  if (error) throw error;
  return data ?? [];
}

export async function createComment(noteNo: number, content: string, userId: string) {
  if (!supabase) return null;
  const trimmed = content.trim().slice(0, 1000);
  if (!trimmed) throw new Error('댓글 내용을 입력해주세요.');
  const { data, error } = await supabase
    .from('comment')
    .insert({ noteNo, content: trimmed, userId })
    .select('*, user:userId (id, name, nickname, image, profileImage)')
    .single();
  if (error) throw error;
  return data;
}

export async function updateComment(commentNo: number, content: string, userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('comment')
    .update({ content })
    .eq('commentNo', commentNo)
    .eq('userId', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteComment(commentNo: number, userId: string) {
  if (!supabase) return;
  const { error } = await supabase
    .from('comment')
    .delete()
    .eq('commentNo', commentNo)
    .eq('userId', userId);
  if (error) throw error;
}
