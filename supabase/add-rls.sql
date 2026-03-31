-- ============================================
-- RLS Policies for existing note-app database
-- Run this AFTER enabling Supabase Auth
-- Column names: camelCase (matching existing Prisma schema)
-- ============================================

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

-- USER
CREATE POLICY "user_select" ON "user" FOR SELECT USING (true);
CREATE POLICY "user_insert" ON "user" FOR INSERT WITH CHECK (id = auth.uid()::text);
CREATE POLICY "user_update" ON "user" FOR UPDATE USING (id = auth.uid()::text);
CREATE POLICY "user_delete" ON "user" FOR DELETE USING (id = auth.uid()::text);

-- CATEGORY
CREATE POLICY "category_all" ON category FOR ALL USING ("userId" = auth.uid()::text);

-- NOTE
CREATE POLICY "note_owner" ON note FOR ALL USING ("userId" = auth.uid()::text);
CREATE POLICY "note_public_read" ON note FOR SELECT
  USING (
    "isPublic" = true
    AND "delDatetime" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM block
      WHERE ("blockerId" = auth.uid()::text AND "blockedId" = note."userId")
         OR ("blockerId" = note."userId" AND "blockedId" = auth.uid()::text)
    )
  );

-- TAGS
CREATE POLICY "tags_owner" ON tags FOR ALL
  USING (EXISTS (SELECT 1 FROM note WHERE note."noteNo" = tags."noteNo" AND note."userId" = auth.uid()::text));

-- LIKE
CREATE POLICY "like_select" ON "like" FOR SELECT USING (true);
CREATE POLICY "like_insert" ON "like" FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "like_delete" ON "like" FOR DELETE USING ("userId" = auth.uid()::text);

-- COMMENT
CREATE POLICY "comment_select" ON comment FOR SELECT USING (true);
CREATE POLICY "comment_insert" ON comment FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "comment_update" ON comment FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "comment_delete" ON comment FOR DELETE USING ("userId" = auth.uid()::text);

-- IMAGE
CREATE POLICY "image_all" ON image FOR ALL USING ("userId" = auth.uid()::text);

-- REPORT
CREATE POLICY "report_insert" ON report FOR INSERT WITH CHECK ("reporterId" = auth.uid()::text);

-- BLOCK
CREATE POLICY "block_select" ON block FOR SELECT USING ("blockerId" = auth.uid()::text);
CREATE POLICY "block_insert" ON block FOR INSERT WITH CHECK ("blockerId" = auth.uid()::text);
CREATE POLICY "block_delete" ON block FOR DELETE USING ("blockerId" = auth.uid()::text);

-- CONVERSATION
CREATE POLICY "conversation_all" ON conversation FOR ALL
  USING ("user1Id" = auth.uid()::text OR "user2Id" = auth.uid()::text);

-- MESSAGE
CREATE POLICY "message_select" ON message FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversation c
    WHERE c."convNo" = message."convNo"
    AND (c."user1Id" = auth.uid()::text OR c."user2Id" = auth.uid()::text)
  ));
CREATE POLICY "message_insert" ON message FOR INSERT
  WITH CHECK (
    "senderId" = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM conversation c
      WHERE c."convNo" = message."convNo"
      AND (c."user1Id" = auth.uid()::text OR c."user2Id" = auth.uid()::text)
    )
  );
CREATE POLICY "message_update" ON message FOR UPDATE
  USING (
    "senderId" = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM conversation c
      WHERE c."convNo" = message."convNo"
      AND (c."user1Id" = auth.uid()::text OR c."user2Id" = auth.uid()::text)
    )
  );

-- Auto-create user profile on Supabase Auth signup
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
