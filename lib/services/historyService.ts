import { supabase } from '../supabase';

const MAX_HISTORY_PER_NOTE = 50;

export interface NoteHistoryItem {
  history_no: number;
  note_no: number;
  user_id: string;
  title: string | null;
  content: string | null;
  plain_text: string | null;
  saved_at: string;
}

/**
 * 현재 노트 내용을 히스토리에 저장 (저장 전에 호출)
 */
export async function saveNoteHistory(
  noteNo: number,
  userId: string,
  title: string,
  content: string,
  plainText: string
): Promise<void> {
  if (!supabase) return;

  // 빈 내용이면 히스토리 저장하지 않음
  if (!title?.trim() && !plainText?.trim()) return;

  await supabase.from('note_history').insert({
    note_no: noteNo,
    user_id: userId,
    title,
    content,
    plain_text: plainText,
  });

  // 오래된 히스토리 정리 (MAX 초과분 삭제)
  const { data: histories } = await supabase
    .from('note_history')
    .select('history_no')
    .eq('note_no', noteNo)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (histories && histories.length > MAX_HISTORY_PER_NOTE) {
    const toDelete = histories
      .slice(MAX_HISTORY_PER_NOTE)
      .map((h) => h.history_no);

    await supabase
      .from('note_history')
      .delete()
      .in('history_no', toDelete);
  }
}

/**
 * 노트의 히스토리 목록 조회
 */
export async function fetchNoteHistory(
  noteNo: number,
  userId: string
): Promise<NoteHistoryItem[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('note_history')
    .select('*')
    .eq('note_no', noteNo)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
    .limit(MAX_HISTORY_PER_NOTE);

  if (error) throw error;
  return data ?? [];
}

/**
 * 특정 히스토리 항목 조회
 */
export async function fetchHistoryDetail(
  historyNo: number,
  userId: string
): Promise<NoteHistoryItem | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('note_history')
    .select('*')
    .eq('history_no', historyNo)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * 히스토리에서 노트 복원 (현재 내용을 히스토리에 저장 후 복원)
 */
export async function restoreFromHistory(
  historyNo: number,
  noteNo: number,
  userId: string,
  currentTitle: string,
  currentContent: string,
  currentPlainText: string
): Promise<NoteHistoryItem | null> {
  if (!supabase) return null;

  // 1. 현재 내용을 히스토리에 저장
  await saveNoteHistory(noteNo, userId, currentTitle, currentContent, currentPlainText);

  // 2. 복원할 히스토리 가져오기
  const history = await fetchHistoryDetail(historyNo, userId);
  if (!history) throw new Error('히스토리를 찾을 수 없습니다');

  // 3. 노트 업데이트
  const { error } = await supabase
    .from('note')
    .update({
      title: history.title || '',
      content: history.content || '',
      plainText: history.plain_text || '',
      modDatetime: new Date().toISOString(),
    })
    .eq('noteNo', noteNo)
    .eq('userId', userId);

  if (error) throw error;

  return history;
}

/**
 * 특정 히스토리 삭제
 */
export async function deleteHistory(
  historyNo: number,
  userId: string
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('note_history')
    .delete()
    .eq('history_no', historyNo)
    .eq('user_id', userId);

  if (error) throw error;
}
