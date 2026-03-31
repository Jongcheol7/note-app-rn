-- ============================================
-- note-app-rn Supabase Schema
-- Migrated from Prisma schema (note-app)
-- ============================================
-- NOTE: Account, Session tables are dropped.
--       Supabase Auth handles OAuth & sessions natively.
-- NOTE: User table uses auth.users.id as FK.
-- ============================================

-- ==================
-- 1. TABLES
-- ==================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS "user" (
  id            TEXT PRIMARY KEY,  -- matches auth.users.id
  name          TEXT,
  email         TEXT UNIQUE,
  image         TEXT,              -- Google avatar URL
  nickname      TEXT,
  profile_image TEXT,              -- custom uploaded avatar
  bio           TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Category
CREATE TABLE IF NOT EXISTS category (
  category_no    SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  user_id        TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  sort_order     INT NOT NULL DEFAULT 0,
  input_datetime TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Note
CREATE TABLE IF NOT EXISTS note (
  note_no        SERIAL PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  content        TEXT NOT NULL,
  plain_text     TEXT NOT NULL,
  category_no    INT REFERENCES category(category_no) ON DELETE SET NULL,
  sort_order     INT NOT NULL DEFAULT 0,
  color          TEXT,
  is_public      BOOLEAN NOT NULL DEFAULT false,
  alarm_datetime TIMESTAMPTZ,
  input_datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
  mod_datetime   TIMESTAMPTZ,
  del_datetime   TIMESTAMPTZ,
  is_pinned      BOOLEAN NOT NULL DEFAULT false,
  pin_datetime   TIMESTAMPTZ
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  tag_no         SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  note_no        INT NOT NULL REFERENCES note(note_no) ON DELETE CASCADE,
  input_datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, note_no)
);

-- Like
CREATE TABLE IF NOT EXISTS "like" (
  like_no        SERIAL PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  note_no        INT NOT NULL REFERENCES note(note_no) ON DELETE CASCADE,
  input_datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, note_no)
);

-- Comment
CREATE TABLE IF NOT EXISTS comment (
  comment_no     SERIAL PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  note_no        INT NOT NULL REFERENCES note(note_no) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  input_datetime TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Image (storage quota tracking)
CREATE TABLE IF NOT EXISTS image (
  image_no       SERIAL PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  file_url       TEXT NOT NULL UNIQUE,
  file_size      INT NOT NULL,  -- bytes
  input_datetime TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Report
CREATE TABLE IF NOT EXISTS report (
  report_no      SERIAL PRIMARY KEY,
  reporter_id    TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  target_user_id TEXT,
  target_note_no INT,
  reason         TEXT NOT NULL,
  input_datetime TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Block
CREATE TABLE IF NOT EXISTS block (
  block_no       SERIAL PRIMARY KEY,
  blocker_id     TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  blocked_id     TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  input_datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Conversation
CREATE TABLE IF NOT EXISTS conversation (
  conv_no        SERIAL PRIMARY KEY,
  user1_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  user2_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  last_message   TEXT,
  last_datetime  TIMESTAMPTZ,
  input_datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Message
CREATE TABLE IF NOT EXISTS message (
  msg_no         SERIAL PRIMARY KEY,
  conv_no        INT NOT NULL REFERENCES conversation(conv_no) ON DELETE CASCADE,
  sender_id      TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  is_read        BOOLEAN NOT NULL DEFAULT false,
  input_datetime TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- UserSettings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id        TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  input_datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
  mod_datetime   TIMESTAMPTZ
);

-- ==================
-- 2. INDEXES
-- ==================

CREATE INDEX IF NOT EXISTS idx_note_user_list
  ON note(user_id, del_datetime, is_pinned DESC, pin_datetime DESC, mod_datetime DESC);

CREATE INDEX IF NOT EXISTS idx_note_public
  ON note(is_public, del_datetime);

CREATE INDEX IF NOT EXISTS idx_note_category
  ON note(category_no);

CREATE INDEX IF NOT EXISTS idx_comment_note_time
  ON comment(note_no, input_datetime);

CREATE INDEX IF NOT EXISTS idx_image_user
  ON image(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_user1
  ON conversation(user1_id, last_datetime);

CREATE INDEX IF NOT EXISTS idx_conversation_user2
  ON conversation(user2_id, last_datetime);

CREATE INDEX IF NOT EXISTS idx_message_conv_time
  ON message(conv_no, input_datetime);

-- ==================
-- 3. RLS POLICIES
-- ==================

-- Enable RLS on all tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE note ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE "like" ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment ENABLE ROW LEVEL SECURITY;
ALTER TABLE image ENABLE ROW LEVEL SECURITY;
ALTER TABLE report ENABLE ROW LEVEL SECURITY;
ALTER TABLE block ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation ENABLE ROW LEVEL SECURITY;
ALTER TABLE message ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- USER: anyone can read, only self can update
CREATE POLICY "user_select" ON "user" FOR SELECT USING (true);
CREATE POLICY "user_insert" ON "user" FOR INSERT WITH CHECK (id = auth.uid()::text);
CREATE POLICY "user_update" ON "user" FOR UPDATE USING (id = auth.uid()::text);
CREATE POLICY "user_delete" ON "user" FOR DELETE USING (id = auth.uid()::text);

-- CATEGORY: owner only
CREATE POLICY "category_all" ON category FOR ALL USING (user_id = auth.uid()::text);

-- NOTE: owner can do all, public notes readable by authenticated (excluding blocked)
CREATE POLICY "note_owner" ON note FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "note_public_read" ON note FOR SELECT
  USING (
    is_public = true
    AND del_datetime IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM block
      WHERE blocker_id = auth.uid()::text AND blocked_id = note.user_id
    )
  );

-- TAGS: via note ownership
CREATE POLICY "tags_owner" ON tags FOR ALL
  USING (EXISTS (SELECT 1 FROM note WHERE note.note_no = tags.note_no AND note.user_id = auth.uid()::text));

-- LIKE: authenticated insert/delete own, select on public notes
CREATE POLICY "like_select" ON "like" FOR SELECT USING (true);
CREATE POLICY "like_insert" ON "like" FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "like_delete" ON "like" FOR DELETE USING (user_id = auth.uid()::text);

-- COMMENT: authenticated CRUD on own, select all on public notes
CREATE POLICY "comment_select" ON comment FOR SELECT USING (true);
CREATE POLICY "comment_insert" ON comment FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "comment_update" ON comment FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "comment_delete" ON comment FOR DELETE USING (user_id = auth.uid()::text);

-- IMAGE: owner only
CREATE POLICY "image_all" ON image FOR ALL USING (user_id = auth.uid()::text);

-- REPORT: authenticated insert only
CREATE POLICY "report_insert" ON report FOR INSERT WITH CHECK (reporter_id = auth.uid()::text);

-- BLOCK: blocker can manage
CREATE POLICY "block_select" ON block FOR SELECT USING (blocker_id = auth.uid()::text);
CREATE POLICY "block_insert" ON block FOR INSERT WITH CHECK (blocker_id = auth.uid()::text);
CREATE POLICY "block_delete" ON block FOR DELETE USING (blocker_id = auth.uid()::text);

-- CONVERSATION: participants only
CREATE POLICY "conversation_all" ON conversation FOR ALL
  USING (user1_id = auth.uid()::text OR user2_id = auth.uid()::text);

-- MESSAGE: conversation participants only
CREATE POLICY "message_select" ON message FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversation c
    WHERE c.conv_no = message.conv_no
    AND (c.user1_id = auth.uid()::text OR c.user2_id = auth.uid()::text)
  ));
CREATE POLICY "message_insert" ON message FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM conversation c
      WHERE c.conv_no = message.conv_no
      AND (c.user1_id = auth.uid()::text OR c.user2_id = auth.uid()::text)
    )
  );
CREATE POLICY "message_update" ON message FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM conversation c
    WHERE c.conv_no = message.conv_no
    AND (c.user1_id = auth.uid()::text OR c.user2_id = auth.uid()::text)
  ));

-- USER_SETTINGS: owner only
CREATE POLICY "user_settings_all" ON user_settings FOR ALL USING (user_id = auth.uid()::text);

-- ==================
-- 4. FUNCTIONS
-- ==================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."user" (id, email, name, image)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: run after auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================
-- 5. STORAGE BUCKETS
-- ==================
-- Run these in Supabase Dashboard > Storage:
-- 1. Create bucket "notes" (public: false)
-- 2. Create bucket "profiles" (public: true)
--
-- Storage policies (set via Dashboard):
-- notes bucket:
--   SELECT: authenticated, path starts with user's ID
--   INSERT: authenticated, path starts with user's ID, max 10MB
--   DELETE: authenticated, path starts with user's ID
--
-- profiles bucket:
--   SELECT: public
--   INSERT: authenticated, path starts with user's ID, max 5MB
--   DELETE: authenticated, path starts with user's ID
