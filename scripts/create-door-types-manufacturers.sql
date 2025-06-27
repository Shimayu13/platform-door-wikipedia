-- ホームドアタイプとメーカー管理用のテーブル作成

-- ホームドアタイプテーブル
CREATE TABLE IF NOT EXISTS door_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- メーカーテーブル
CREATE TABLE IF NOT EXISTS manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  website_url VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_door_types_name ON door_types(name);
CREATE INDEX IF NOT EXISTS idx_manufacturers_name ON manufacturers(name);

-- RLS (Row Level Security) の有効化
ALTER TABLE door_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;

-- 基本的なRLSポリシー（読み取り専用）
CREATE POLICY "Public read access" ON door_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON manufacturers FOR SELECT USING (true);

-- 編集者以上が管理可能
CREATE POLICY "Editors can insert door types" ON door_types FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('編集者', '開発者')
  )
);

CREATE POLICY "Editors can update door types" ON door_types FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('編集者', '開発者')
  )
);

CREATE POLICY "Editors can delete door types" ON door_types FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('編集者', '開発者')
  )
);

CREATE POLICY "Editors can insert manufacturers" ON manufacturers FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('編集者', '開発者')
  )
);

CREATE POLICY "Editors can update manufacturers" ON manufacturers FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('編集者', '開発者')
  )
);

CREATE POLICY "Editors can delete manufacturers" ON manufacturers FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('編集者', '開発者')
  )
);

-- 初期データの投入
INSERT INTO door_types (name, description) VALUES
('フルハイト', '天井まで届く高さのホームドア'),
('ハーフハイト', '腰の高さ程度のホームドア'),
('ロープ式', 'ロープを使用したホームドア'),
('昇降バー式', 'バーが昇降するタイプのホームドア'),
('可動式ホーム柵', '可動式の柵タイプ'),
('その他', 'その他のタイプ')
ON CONFLICT (name) DO NOTHING;

INSERT INTO manufacturers (name, website_url, description) VALUES
('日本信号', 'https://www.signal.co.jp/', '鉄道信号・保安システムの大手メーカー'),
('京三製作所', 'https://www.kyosan.co.jp/', '鉄道信号機器の専門メーカー'),
('三菱電機', 'https://www.mitsubishielectric.co.jp/', '総合電機メーカー'),
('東芝', 'https://www.toshiba.co.jp/', '総合電機メーカー'),
('大同信号', 'https://www.daidoshingo.co.jp/', '鉄道信号機器メーカー'),
('ナブテスコ', 'https://www.nabtesco.com/', '精密機器メーカー'),
('川崎重工業', 'https://www.khi.co.jp/', '重工業メーカー'),
('日立製作所', 'https://www.hitachi.co.jp/', '総合電機メーカー')
ON CONFLICT (name) DO NOTHING;
