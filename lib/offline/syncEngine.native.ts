import { Platform } from 'react-native';
import { supabase } from '../supabase';
import { getDatabase } from './database';

// ==================
// NETWORK STATUS
// ==================
let isOnline = true;
let isSyncingRef = false; // Use plain variable instead of useState to avoid closure issues

export function getIsOnline() {
  return isOnline;
}

export function initNetworkListener(onChange?: (online: boolean) => void) {
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
// PULL: Supabase → SQLite (camelCase from DB → snake_case local cache)
// ==================
export async function pullNotes(userId: string) {
  if (!supabase || !isOnline) return;

  const db = await getDatabase();

  const meta = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM sync_meta WHERE key = ?',
    ['last_note_sync']
  );
  const lastSync = meta?.value || '1970-01-01T00:00:00Z';

  // Paginated pull to handle large datasets
  let allNotes: any[] = [];
  let from = 0;
  const batchSize = 200;

  while (true) {
    const { data: batch, error } = await supabase
      .from('note')
      .select('*')
      .eq('userId', userId)
      .gte('modDatetime', lastSync)
      .order('modDatetime', { ascending: false })
      .range(from, from + batchSize - 1);

    if (error || !batch?.length) break;
    allNotes = allNotes.concat(batch);
    if (batch.length < batchSize) break;
    from += batchSize;
  }

  if (!allNotes.length) return;

  const now = new Date().toISOString();

  // Map camelCase (Supabase) → snake_case (local SQLite cache)
  for (const note of allNotes) {
    await db.runAsync(
      `INSERT OR REPLACE INTO note_cache
       (note_no, user_id, title, content, plain_text, category_no, sort_order,
        color, is_public, alarm_datetime, input_datetime, mod_datetime,
        del_datetime, is_pinned, pin_datetime, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        note.noteNo, note.userId, note.title, note.content,
        note.plainText, note.categoryNo, note.sortOrder,
        note.color, note.isPublic ? 1 : 0, note.alarmDatetime,
        note.inputDatetime, note.modDatetime, note.delDatetime,
        note.isPinned ? 1 : 0, note.pinDatetime, now,
      ]
    );
  }

  await db.runAsync(
    'INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)',
    ['last_note_sync', now]
  );

  // Clean up notes that were hard-deleted on server
  // (notes in local cache but not on server anymore)
  const { data: serverIds } = await supabase
    .from('note')
    .select('noteNo')
    .eq('userId', userId);

  if (serverIds) {
    const serverNoteNos = new Set(serverIds.map((n: any) => n.noteNo));
    const localNotes = await db.getAllAsync<{ note_no: number }>(
      'SELECT note_no FROM note_cache WHERE user_id = ?',
      [userId]
    );
    for (const local of localNotes) {
      if (!serverNoteNos.has(local.note_no)) {
        await db.runAsync('DELETE FROM note_cache WHERE note_no = ?', [local.note_no]);
      }
    }
  }
}

export async function pullCategories(userId: string) {
  if (!supabase || !isOnline) return;

  const db = await getDatabase();
  const { data: categories } = await supabase
    .from('category')
    .select('*')
    .eq('userId', userId)
    .order('sortOrder');

  if (!categories?.length) return;

  const now = new Date().toISOString();

  // Use transaction for atomic category sync
  await db.execAsync('BEGIN TRANSACTION');
  try {
    await db.runAsync('DELETE FROM category_cache WHERE user_id = ?', [userId]);
    for (const cat of categories) {
      await db.runAsync(
        'INSERT INTO category_cache (category_no, name, user_id, sort_order, synced_at) VALUES (?, ?, ?, ?, ?)',
        [cat.categoryNo, cat.name, cat.userId, cat.sortOrder, now]
      );
    }
    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
}

// ==================
// PUSH: Offline queue → Supabase
// ==================
export async function pushOfflineQueue() {
  if (!supabase || !isOnline) return;

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

      await db.runAsync(
        'UPDATE offline_queue SET status = ? WHERE id = ?',
        ['completed', item.id]
      );
    } catch (err) {
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

  // Cleanup completed and old failed items
  await db.runAsync(
    "DELETE FROM offline_queue WHERE status IN ('completed', 'failed')"
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
  const db = await getDatabase();

  let sql = 'SELECT * FROM note_cache WHERE user_id = ?';
  const params: (string | number)[] = [userId];

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
  const db = await getDatabase();
  return db.getAllAsync(
    'SELECT * FROM category_cache WHERE user_id = ? ORDER BY sort_order',
    [userId]
  );
}

// ==================
// FULL SYNC (with lock to prevent concurrent syncs)
// ==================
export async function fullSync(userId: string) {
  if (!isOnline || isSyncingRef) return;

  isSyncingRef = true;
  try {
    await pushOfflineQueue();
    await pullNotes(userId);
    await pullCategories(userId);
  } finally {
    isSyncingRef = false;
  }
}
