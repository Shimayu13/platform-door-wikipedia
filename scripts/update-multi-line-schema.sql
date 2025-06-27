-- 複数路線対応のためのデータベーススキーマ更新

-- 駅と路線の多対多関係を管理する中間テーブルを作成
CREATE TABLE IF NOT EXISTS station_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  line_id UUID NOT NULL REFERENCES lines(id) ON DELETE CASCADE,
  platform_prefix VARCHAR(10), -- ホーム番号のプレフィックス（例：JR1, 東急1など）
  notes TEXT, -- この駅での路線に関する特記事項
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(station_id, line_id)
);

-- platform_doorsテーブルにline_idを追加
ALTER TABLE platform_doors ADD COLUMN IF NOT EXISTS line_id UUID REFERENCES lines(id);

-- 既存データの移行
-- 1. 既存の駅データから station_lines を作成
-- (この部分は初回実行時のみでOKです)
-- INSERT INTO station_lines (station_id, line_id)
-- SELECT id, line_id
-- FROM stations
-- WHERE line_id IS NOT NULL
-- ON CONFLICT (station_id, line_id) DO NOTHING;

-- 2. platform_doorsのline_idを設定
-- (この部分は初回実行時のみでOKです)
-- UPDATE platform_doors
-- SET line_id = stations.line_id
-- FROM stations
-- WHERE platform_doors.station_id = stations.id
-- AND platform_doors.line_id IS NULL;

-- 3. stationsテーブルからline_idを削除（後方互換性のため段階的に実施）
-- ▼▼▼ この行のコメントアウトを解除、またはこの行を実行 ▼▼▼
ALTER TABLE stations DROP COLUMN IF EXISTS line_id;
-- ▲▲▲ 修正箇所 ▲▲▲

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_station_lines_station_id ON station_lines(station_id);
CREATE INDEX IF NOT EXISTS idx_station_lines_line_id ON station_lines(line_id);
CREATE INDEX IF NOT EXISTS idx_platform_doors_line_id ON platform_doors(line_id);

-- RLS (Row Level Security) の設定
ALTER TABLE station_lines ENABLE ROW LEVEL SECURITY;

-- 基本的なRLSポリシー
CREATE POLICY "Public read access" ON station_lines FOR SELECT USING (true);

CREATE POLICY "Editors can insert station lines" ON station_lines FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('編集者', '開発者')
  )
);

CREATE POLICY "Editors can update station lines" ON station_lines FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('編集者', '開発者')
  )
);

CREATE POLICY "Editors can delete station lines" ON station_lines FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('編集者', '開発者')
  )
);

-- platform_doorsテーブルのNOT NULL制約を追加（データ移行後）
-- ALTER TABLE platform_doors ALTER COLUMN line_id SET NOT NULL;