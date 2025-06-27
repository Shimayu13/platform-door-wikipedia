-- データベースの初期設定
-- Supabaseで実行するSQLスクリプト

-- 鉄道会社テーブル
CREATE TABLE IF NOT EXISTS railway_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('JR', '私鉄')),
  website_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 路線テーブル
CREATE TABLE IF NOT EXISTS lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  company_id UUID NOT NULL REFERENCES railway_companies(id) ON DELETE CASCADE,
  line_color VARCHAR(7), -- HEXカラーコード
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, company_id)
);

-- 駅テーブル
CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  line_id UUID NOT NULL REFERENCES lines(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  prefecture VARCHAR(20) NOT NULL,
  city VARCHAR(50),
  address TEXT,
  station_code VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ホームドア設置状況テーブル
CREATE TABLE IF NOT EXISTS platform_doors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  platform_number VARCHAR(10) NOT NULL,
  platform_name VARCHAR(50),
  status VARCHAR(20) NOT NULL CHECK (status IN ('設置済み', '工事中', '計画中', '未設置')),
  installation_date DATE,
  planned_date DATE,
  door_type VARCHAR(50), -- フルハイト、ハーフハイト等
  manufacturer VARCHAR(100),
  notes TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(station_id, platform_number)
);

-- ニュース記事テーブル
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  author_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT '下書き' CHECK (status IN ('下書き', '公開', '非公開')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザープロフィールテーブル
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 更新履歴テーブル
CREATE TABLE IF NOT EXISTS update_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_stations_prefecture ON stations(prefecture);
CREATE INDEX IF NOT EXISTS idx_stations_line_id ON stations(line_id);
CREATE INDEX IF NOT EXISTS idx_platform_doors_station_id ON platform_doors(station_id);
CREATE INDEX IF NOT EXISTS idx_platform_doors_status ON platform_doors(status);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);

-- RLS (Row Level Security) の有効化
ALTER TABLE railway_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_doors ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_history ENABLE ROW LEVEL SECURITY;

-- 基本的なRLSポリシー（読み取り専用）
CREATE POLICY "Public read access" ON railway_companies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON lines FOR SELECT USING (true);
CREATE POLICY "Public read access" ON stations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON platform_doors FOR SELECT USING (true);
CREATE POLICY "Public read access" ON news FOR SELECT USING (status = '公開');

-- ユーザープロフィールのポリシー
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
