import { supabase } from '../supabase';

export async function fetchUserProfile(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user')
    .select('id, name, email, image, nickname, profileImage, bio, plan')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchUserPublicNotes(userId: string, cursor?: number) {
  if (!supabase) return { notes: [], nextCursor: undefined };
  let query = supabase
    .from('note')
    .select('noteNo, title, plainText, inputDatetime, like(likeNo), comment(commentNo)')
    .eq('userId', userId)
    .eq('isPublic', true)
    .is('delDatetime', null)
    .order('inputDatetime', { ascending: false })
    .limit(10);

  if (cursor) query = query.lt('noteNo', cursor);

  const { data, error } = await query;
  if (error) throw error;
  const notes = data ?? [];
  const nextCursor = notes.length === 10 ? notes[notes.length - 1]?.noteNo : undefined;
  return { notes, nextCursor };
}

export async function updateProfile(
  userId: string,
  updates: { nickname?: string; bio?: string; profileImage?: string }
) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchNoteCount(userId: string) {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from('note')
    .select('*', { count: 'exact', head: true })
    .eq('userId', userId)
    .is('delDatetime', null);
  if (error) throw error;
  return count ?? 0;
}

export async function fetchStorageUsage(userId: string) {
  if (!supabase) return 0;
  const { data } = await supabase
    .from('image')
    .select('fileSize')
    .eq('userId', userId);
  return data?.reduce((sum, img) => sum + img.fileSize, 0) ?? 0;
}

// Block
export async function blockUser(blockerId: string, blockedId: string) {
  if (!supabase) return;
  const { error } = await supabase
    .from('block')
    .insert({ blockerId, blockedId });
  if (error) throw error;
}

export async function unblockUser(blockerId: string, blockedId: string) {
  if (!supabase) return;
  const { error } = await supabase
    .from('block')
    .delete()
    .eq('blockerId', blockerId)
    .eq('blockedId', blockedId);
  if (error) throw error;
}

export async function fetchBlockList(blockerId: string) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('block')
    .select('blockedId')
    .eq('blockerId', blockerId);
  return data?.map((b) => b.blockedId) ?? [];
}

export async function isBlocked(blockerId: string, blockedId: string) {
  if (!supabase) return false;
  const { data } = await supabase
    .from('block')
    .select('blockNo')
    .eq('blockerId', blockerId)
    .eq('blockedId', blockedId)
    .single();
  return !!data;
}

// Report
export async function reportUser(
  reporterId: string,
  targetUserId: string | null,
  targetNoteNo: number | null,
  reason: string
) {
  if (!supabase) return;
  const { error } = await supabase
    .from('report')
    .insert({ reporterId, targetUserId, targetNoteNo, reason });
  if (error) throw error;
}

// Account deletion
export async function deleteAccount(userId: string) {
  if (!supabase) return;
  const { data: images } = await supabase
    .from('image')
    .select('fileUrl')
    .eq('userId', userId);

  if (images?.length) {
    const paths = images
      .map((img) => {
        const url = new URL(img.fileUrl);
        const parts = url.pathname.split('/storage/v1/object/public/notes/');
        return parts.length >= 2 ? parts[1] : null;
      })
      .filter(Boolean) as string[];

    if (paths.length) {
      await supabase.storage.from('notes').remove(paths);
    }
  }

  await supabase.from('user').delete().eq('id', userId);
}
