import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('noteapp.db');
  await initSchema(db);
  return db;
}

async function initSchema(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS note_cache (
      note_no INTEGER PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      plain_text TEXT NOT NULL,
      category_no INTEGER,
      sort_order INTEGER NOT NULL DEFAULT 0,
      color TEXT,
      is_public INTEGER NOT NULL DEFAULT 0,
      alarm_datetime TEXT,
      input_datetime TEXT NOT NULL,
      mod_datetime TEXT,
      del_datetime TEXT,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      pin_datetime TEXT,
      synced_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS category_cache (
      category_no INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      user_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      synced_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS offline_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      table_name TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      retries INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_note_cache_user
      ON note_cache(user_id, del_datetime, is_pinned DESC, pin_datetime DESC, mod_datetime DESC);

    CREATE INDEX IF NOT EXISTS idx_offline_queue_status
      ON offline_queue(status);
  `);
}

export async function clearDatabase() {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM note_cache;
    DELETE FROM category_cache;
    DELETE FROM offline_queue;
    DELETE FROM sync_meta;
  `);
}
