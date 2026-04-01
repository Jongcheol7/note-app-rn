import { supabase } from '../supabase';
import { sanitizeHtml } from '../utils/sanitize';
import { saveNoteHistory } from './historyService';

const PAGE_SIZE = 10;

// ==================
// NOTE LIST (cursor-based pagination)
// ==================
interface NoteListParams {
  cursor?: number;
  limit?: number;
  keyword?: string;
  menuFrom: string;
  categoryName?: string;
  userId: string;
}

/**
 * Purge notes deleted more than 30 days ago.
 * Should be called separately, not inside query functions.
 */
export async function purgeOldTrashNotes(userId: string) {
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();
  await supabase
    .from('note')
    .delete()
    .eq('userId', userId)
    .not('delDatetime', 'is', null)
    .lt('delDatetime', thirtyDaysAgo);
}

export async function fetchNotes({
  cursor,
  limit = PAGE_SIZE,
  keyword,
  menuFrom,
  categoryName,
  userId,
}: NoteListParams) {
  let query = supabase
    .from('note')
    .select(
      `
      *,
      user:userId (id, name, email, image, nickname, profileImage),
      category:categoryNo (categoryNo, name),
      like (likeNo, userId),
      comment (commentNo)
    `
    )
    .limit(limit);

  // Menu filtering
  if (menuFrom === 'trash') {
    query = query.eq('userId', userId).not('delDatetime', 'is', null);
  } else if (menuFrom === 'community') {
    query = query
      .eq('isPublic', true)
      .is('delDatetime', null)
      .neq('userId', userId);
  } else {
    // Home (default)
    query = query.eq('userId', userId).is('delDatetime', null);
  }

  // Category filter
  if (categoryName && menuFrom !== 'community') {
    query = query.eq('category.name', categoryName);
  }

  // Keyword search
  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,plainText.ilike.%${keyword}%`
    );
  }

  // Ordering
  if (menuFrom === 'trash') {
    query = query.order('delDatetime', { ascending: false });
  } else if (menuFrom === 'community') {
    query = query.order('inputDatetime', { ascending: false });
  } else {
    query = query
      .order('isPinned', { ascending: false })
      .order('pinDatetime', { ascending: false, nullsFirst: false })
      .order('modDatetime', { ascending: false, nullsFirst: false });
  }

  // Cursor pagination
  if (cursor) {
    query = query.lt('noteNo', cursor);
  }

  const { data, error } = await query;
  if (error) throw error;

  const notes = data ?? [];
  const nextCursor =
    notes.length === limit ? notes[notes.length - 1]?.noteNo : undefined;

  return { notes, nextCursor };
}

// ==================
// NOTE DETAIL
// ==================
export async function fetchNoteDetail(noteNo: number, menuFrom: string) {
  const { data, error } = await supabase
    .from('note')
    .select(
      `
      *,
      user:userId (id, name, email, image, nickname, profileImage, bio),
      category:categoryNo (categoryNo, name),
      like (likeNo, userId),
      comment (commentNo)
    `
    )
    .eq('noteNo', noteNo)
    .single();

  if (error) throw error;
  return data;
}

// ==================
// SAVE NOTE (create or update)
// ==================
interface SaveNoteParams {
  noteNo?: number | null;
  userId: string;
  title: string;
  content: string;
  plainText: string;
  categoryNo?: number | null;
  color?: string | null;
  isPublic?: boolean;
  alarmDatetime?: string | null;
}

export async function saveNote({
  noteNo,
  userId,
  title,
  content,
  plainText,
  categoryNo,
  color,
  isPublic = false,
  alarmDatetime,
}: SaveNoteParams) {
  // Sanitize HTML content before saving
  const sanitizedContent = sanitizeHtml(content);
  // Validate input lengths
  const trimmedTitle = (title || '').slice(0, 200);

  if (noteNo) {
    // 업데이트 전 현재 내용을 히스토리에 저장
    try {
      const { data: current } = await supabase
        .from('note')
        .select('title, content, plainText')
        .eq('noteNo', noteNo)
        .eq('userId', userId)
        .single();

      if (current) {
        await saveNoteHistory(
          noteNo,
          userId,
          current.title || '',
          current.content || '',
          current.plainText || ''
        );
      }
    } catch {
      // 히스토리 저장 실패해도 저장은 계속 진행
    }

    // Update existing
    const { data, error } = await supabase
      .from('note')
      .update({
        title: trimmedTitle,
        content: sanitizedContent,
        plainText,
        categoryNo: categoryNo === -1 ? null : categoryNo,
        color,
        isPublic,
        alarmDatetime,
        modDatetime: new Date().toISOString(),
      })
      .eq('noteNo', noteNo)
      .eq('userId', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new
    const { data: maxData } = await supabase
      .from('note')
      .select('sortOrder')
      .eq('userId', userId)
      .order('sortOrder', { ascending: false })
      .limit(1)
      .single();

    const sortOrder = (maxData?.sortOrder ?? 0) + 1;

    const { data, error } = await supabase
      .from('note')
      .insert({
        userId,
        title: trimmedTitle,
        content: sanitizedContent,
        plainText,
        categoryNo: categoryNo === -1 ? null : categoryNo,
        sortOrder,
        color,
        isPublic,
        alarmDatetime,
        modDatetime: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ==================
// SOFT DELETE
// ==================
export async function softDeleteNote(noteNo: number, userId: string) {
  const { data, error } = await supabase
    .from('note')
    .update({ delDatetime: new Date().toISOString() })
    .eq('noteNo', noteNo)
    .eq('userId', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================
// HARD DELETE
// ==================
export async function hardDeleteNote(noteNo: number, userId: string) {
  const { error } = await supabase
    .from('note')
    .delete()
    .eq('noteNo', noteNo)
    .eq('userId', userId);

  if (error) throw error;
}

// ==================
// RECOVER FROM TRASH
// ==================
export async function recoverNote(noteNo: number, userId: string) {
  const { data, error } = await supabase
    .from('note')
    .update({ delDatetime: null })
    .eq('noteNo', noteNo)
    .eq('userId', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================
// PIN / UNPIN
// ==================
export async function togglePinNote(
  noteNo: number,
  isPinned: boolean,
  userId: string
) {
  const { data, error } = await supabase
    .from('note')
    .update({
      isPinned,
      pinDatetime: isPinned ? new Date().toISOString() : null,
    })
    .eq('noteNo', noteNo)
    .eq('userId', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================
// COLOR CHANGE
// ==================
export async function changeNoteColor(
  noteNo: number,
  color: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('note')
    .update({
      color,
      modDatetime: new Date().toISOString(),
    })
    .eq('noteNo', noteNo)
    .eq('userId', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================
// PUBLIC TOGGLE
// ==================
export async function toggleNotePublic(
  noteNo: number,
  isPublic: boolean,
  userId: string
) {
  const { data, error } = await supabase
    .from('note')
    .update({
      isPublic,
      modDatetime: new Date().toISOString(),
    })
    .eq('noteNo', noteNo)
    .eq('userId', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================
// LIKE TOGGLE
// ==================
export async function toggleLike(
  noteNo: number,
  isLike: boolean,
  userId: string
) {
  if (isLike) {
    const { data, error } = await supabase
      .from('like')
      .insert({ userId, noteNo })
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { error } = await supabase
      .from('like')
      .delete()
      .eq('userId', userId)
      .eq('noteNo', noteNo);
    if (error) throw error;
  }
}
