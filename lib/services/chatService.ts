import { supabase } from '../supabase';

export async function fetchConversations(userId: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('conversation')
    .select(`
      *,
      user1:user1Id (id, name, nickname, image, profileImage),
      user2:user2Id (id, name, nickname, image, profileImage)
    `)
    .or(`user1Id.eq.${userId},user2Id.eq.${userId}`)
    .order('lastDatetime', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMessages(convNo: number) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('message')
    .select('*, sender:senderId (id, name, nickname, image, profileImage)')
    .eq('convNo', convNo)
    .order('inputDatetime');
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(convNo: number, senderId: string, content: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('message')
    .insert({ convNo, senderId, content })
    .select()
    .single();
  if (error) throw error;

  await supabase
    .from('conversation')
    .update({
      lastMessage: content,
      lastDatetime: new Date().toISOString(),
    })
    .eq('convNo', convNo);

  return data;
}

export async function markMessagesRead(convNo: number, userId: string) {
  if (!supabase) return;
  await supabase
    .from('message')
    .update({ isRead: true })
    .eq('convNo', convNo)
    .neq('senderId', userId)
    .eq('isRead', false);
}

export async function fetchUnreadCount(userId: string) {
  if (!supabase) return 0;

  const { data: convs } = await supabase
    .from('conversation')
    .select('convNo')
    .or(`user1Id.eq.${userId},user2Id.eq.${userId}`);

  if (!convs?.length) return 0;

  const convNos = convs.map((c) => c.convNo);
  const { count } = await supabase
    .from('message')
    .select('*', { count: 'exact', head: true })
    .in('convNo', convNos)
    .neq('senderId', userId)
    .eq('isRead', false);

  return count ?? 0;
}

export async function findOrCreateConversation(userId: string, otherUserId: string) {
  if (!supabase) return null;

  const [user1Id, user2Id] = [userId, otherUserId].sort();

  const { data: existing } = await supabase
    .from('conversation')
    .select('convNo')
    .eq('user1Id', user1Id)
    .eq('user2Id', user2Id)
    .single();

  if (existing) return existing.convNo;

  const { data, error } = await supabase
    .from('conversation')
    .insert({ user1Id, user2Id })
    .select('convNo')
    .single();

  if (error) throw error;
  return data?.convNo;
}
