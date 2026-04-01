-- 노트 히스토리 테이블
-- 저장할 때마다 이전 버전을 기록하여 원복 가능하게 함

CREATE TABLE IF NOT EXISTS note_history (
  history_no   SERIAL PRIMARY KEY,
  note_no      INT NOT NULL REFERENCES note("noteNo") ON DELETE CASCADE,
  user_id      TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title        TEXT,
  content      TEXT,
  plain_text   TEXT,
  saved_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_note_history_note ON note_history(note_no, saved_at DESC);
CREATE INDEX idx_note_history_user ON note_history(user_id);

-- RLS 정책: 본인 노트의 히스토리만 접근
ALTER TABLE note_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "note_history_select" ON note_history
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "note_history_insert" ON note_history
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "note_history_delete" ON note_history
  FOR DELETE USING (user_id = auth.uid()::text);

-- 노트당 최대 20개 히스토리 유지 (오래된 것 자동 정리는 앱 레벨에서 처리)
