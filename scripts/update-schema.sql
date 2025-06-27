-- データベーススキーマの更新
-- 新しい進捗ステータスと追加フィールドに対応

-- platform_doorsテーブルの更新
-- 既存の制約を削除
ALTER TABLE platform_doors DROP CONSTRAINT IF EXISTS platform_doors_status_check;

-- 新しいフィールドを追加
ALTER TABLE platform_doors ADD COLUMN IF NOT EXISTS direction VARCHAR(50); -- 方向（上り、下り、内回り、外回りなど）
ALTER TABLE platform_doors ADD COLUMN IF NOT EXISTS installation_datetime TIMESTAMP WITH TIME ZONE; -- 設置日時
ALTER TABLE platform_doors ADD COLUMN IF NOT EXISTS operation_datetime TIMESTAMP WITH TIME ZONE; -- 稼働日時

-- 新しい進捗ステータスの制約を追加
ALTER TABLE platform_doors ADD CONSTRAINT platform_doors_status_check 
CHECK (status IN ('未設置', '仮覆工', '復元', '設置', '稼働'));

-- 既存データの進捗ステータスを新しい形式に更新
UPDATE platform_doors SET status = '稼働' WHERE status = '設置済み';
UPDATE platform_doors SET status = '設置' WHERE status = '工事中';
UPDATE platform_doors SET status = '未設置' WHERE status = '計画中';
UPDATE platform_doors SET status = '未設置' WHERE status NOT IN ('稼働', '設置', '仮覆工', '復元');

-- installation_dateからinstallation_datetimeへのデータ移行
UPDATE platform_doors 
SET installation_datetime = installation_date::timestamp with time zone 
WHERE installation_date IS NOT NULL AND installation_datetime IS NULL;

-- 稼働日時を設置日時と同じに設定（既存の設置済みデータ用）
UPDATE platform_doors 
SET operation_datetime = installation_datetime 
WHERE status = '稼働' AND installation_datetime IS NOT NULL AND operation_datetime IS NULL;

-- インデックスの追加
CREATE INDEX IF NOT EXISTS idx_platform_doors_direction ON platform_doors(direction);
CREATE INDEX IF NOT EXISTS idx_platform_doors_installation_datetime ON platform_doors(installation_datetime);
CREATE INDEX IF NOT EXISTS idx_platform_doors_operation_datetime ON platform_doors(operation_datetime);

-- RLSポリシーの更新（編集者以上が駅とホームドア情報を更新可能）
CREATE POLICY "Editors can insert stations" ON stations FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('編集者', '開発者')
  )
);

CREATE POLICY "Editors can update stations" ON stations FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('編集者', '開発者')
  )
);

CREATE POLICY "Contributors can insert platform doors" ON platform_doors FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('提供者', '編集者', '開発者')
  )
);

CREATE POLICY "Contributors can update platform doors" ON platform_doors FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('提供者', '編集者', '開発者')
  )
);

CREATE POLICY "Editors can delete platform doors" ON platform_doors FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('編集者', '開発者')
  )
);
