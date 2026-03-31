import { Platform } from 'react-native';
import { supabase } from '../supabase';
import { getDatabase } from './database';

// ==================
// NETWORK STATUS
// ==================
let isOnline = true;

export function getIsOnline() {
  return isOnline;
}

export function initNetworkListener(onChange?: (online: boolean) => void) {
  if (Platform.OS === 'web') {
    isOnline = navigator.onLine;
    window.addEventListener('online', () => { isOnline = true; onChange?.(true); });
    window.addEventListener('offline', () => { isOnline = false; onChange?.(false); });
    return () => {};
  }

  // Dynamic import to avoid bundling on web
  const NetInfo = require('@react-native-community/netinfo').default;
  const unsubscribe = NetInfo.addEventListener((state: any) => {
    const online = !!state.isConnected && !!state.isInternetReachable;
    if (online !== isOnline) {
      isOnline = online;
      onChange?.(online);
    }
  });
  return unsubscribe;
}

// ==================
// PULL: Supabase → SQLite
// ==================
export async function pullNotes(userId: string) {
  if (Platform.OS === 'web' || !supabase || !isOnline) return;

  const db = await getDatabase();

  // Get last sync time
  const meta = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM sync_meta WHERE key = ?',
    ['last_note_sync']
  );
  const lastSync = meta?.value || '1970-01-01T00:00:00Z';

  // Fetch updated notes from Supabase
  const { data: notes, error } = await supabase
    .from('note')
    .select('*')
    .eq('user_id', userId)
    .gte('mod_datetime', lastSync)
    .order('mod_datetime', { ascending: false })
    .limit(200);

  if (error || !notes?.length) return;

  const now = new Date().toISOString();

  // Upsert into local cache
  for (const note of notes) {
    await db.runAsync(
      `INSERT OR REPLACE INTO note_cache
       (note_no, user_id, title, content, plain_text, category_no, sort_order,
        color, is_public, alarm_datetime, input_datetime, mod_datetime,
        del_datetime, is_pinned, pin_datetime, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        note.note_no, note.user_id, note.title, note.content,
        note.plain_text, note.category_no, note.sort_order,
        note.color, note.is_public ? 1 : 0, note.alarm_datetime,
        note.input_datetime, note.mod_datetime, note.del_datetime,
        note.is_pinned ? 1 : 0, note.pin_datetime, now,
      ]
    );
  }

  // Update sync timestamp
  await db.runAsync(
    'INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)',
    ['last_note_sync', now]
  );
}

export async function pullCategories(userId: string) {
  if (Platform.OS === 'web' || !supabase || !isOnline) return;

  const db = await getDatabase();
  const { data: categories } = await supabase
    .from('category')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order');

  if (!categories?.length) return;

  const now = new Date().toISOString();

  // Clear and re-insert (categories are small)
  await db.runAsync('DELETE FROM category_cache WHERE user_id = ?', [userId]);
  for (const cat of categories) {
    await db.runAsync(
      'INSERT INTO category_cache (category_no, name, user_id, sort_order, synced_at) VALUES (?, ?, ?, ?, ?)',
      [cat.category_no, cat.name, cat.user_id, cat.sort_order, now]
    );
  }
}

// ==================
// PUSH: Offline queue → Supabase
// ==================
export async function pushOfflineQueue() {
  if (Platform.OS === 'web' || !supabase || !isOnline) return;

  const db = await getDatabase();
  const pending = await db.getAllAsync<{
    id: number;
    action: string;
    table_name: string;
    payload: string;
    retries: number;
  }>(
    'SELECT * FROM offline_queue WHERE status = ? ORDER BY id ASC LIMIT 50',
    ['pending']
  );

  for (const item of pending) {
    try {
      const payload = JSON.parse(item.payload);

      if (item.action === 'insert') {
        await supabase.from(item.table_name).insert(payload);
      } else if (item.action === 'update') {
        const { _matchKey, _matchValue, ...updates } = payload;
        await supabase
          .from(item.table_name)
          .update(updates)
          .eq(_matchKey, _matchValue);
      } else if (item.action === 'delete') {
        await supabase
          .from(item.table_name)
          .delete()
          .eq(payload._matchKey, payload._matchValue);
      }

      // Mark as done
      await db.runAsync(
        'UPDATE offline_queue SET status = ? WHERE id = ?',
        ['completed', item.id]
      );
    } catch (err) {
      // Retry up to 3 times
      if (item.retries >= 3) {
        await db.runAsync(
          'UPDATE offline_queue SET status = ? WHERE id = ?',
          ['failed', item.id]
        );
      } else {
        await db.runAsync(
          'UPDATE offline_queue SET retries = retries + 1 WHERE id = ?',
          [item.id]
        );
      }
    }
  }

  // Cleanup completed items
  await db.runAsync(
    "DELETE FROM offline_queue WHERE status = 'completed'"
  );
}

// ==================
// ENQUEUE offline action
// ==================
export async function enqueueAction(
  action: 'insert' | 'update' | 'delete',
  tableName: string,
  payload: Record<string, any>
) {
  if (Platform.OS === 'web') return;
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO offline_queue (action, table_name, payload) VALUES (?, ?, ?)',
    [action, tableName, JSON.stringify(payload)]
  );
}

// ==================
// READ from local cache
// ==================
export async function getLocalNotes(userId: string, options?: {
  keyword?: string;
  categoryNo?: number;
  includeDeleted?: boolean;
}) {
  if (Platform.OS === 'web') return [];
  const db = await getDatabase();

  let sql = 'SELECT * FROM note_cache WHERE user_id = ?';
  const params: any[] = [userId];

  if (!options?.includeDeleted) {
    sql += ' AND del_datetime IS NULL';
  } else {
    sql += ' AND del_datetime IS NOT NULL';
  }

  if (options?.keyword) {
    sql += ' AND (title LIKE ? OR plain_text LIKE ?)';
    params.push(`%${options.keyword}%`, `%${options.keyword}%`);
  }

  if (options?.categoryNo) {
    sql += ' AND category_no = ?';
    params.push(options.categoryNo);
  }

  sql += ' ORDER BY is_pinned DESC, pin_datetime DESC, mod_datetime DESC';

  return db.getAllAsync(sql, params);
}

export async function getLocalCategories(userId: string) {
  if (Platform.OS === 'web') return [];
  const db = await getDatabase();
  return db.getAllAsync(
    'SELECT * FROM category_cache WHERE user_id = ? ORDER BY sort_order',
    [userId]
  );
}

// ==================
// FULL SYNC
// ==================
export async function fullSync(userId: string) {
  if (Platform.OS === 'web' || !isOnline) return;

  // Push first, then pull (to avoid overwriting local changes)
  await pushOfflineQueue();
  await pullNotes(userId);
  await pullCategories(userId);
}
