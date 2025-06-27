-- サンプルデータの投入

-- 鉄道会社データ
INSERT INTO railway_companies (name, type, website_url) VALUES
('JR東日本', 'JR', 'https://www.jreast.co.jp/'),
('JR西日本', 'JR', 'https://www.westjr.co.jp/'),
('JR東海', 'JR', 'https://jr-central.co.jp/'),
('東京メトロ', '私鉄', 'https://www.tokyometro.jp/'),
('都営地下鉄', '私鉄', 'https://www.kotsu.metro.tokyo.jp/'),
('東急電鉄', '私鉄', 'https://www.tokyu.co.jp/'),
('小田急電鉄', '私鉄', 'https://www.odakyu.jp/'),
('京王電鉄', '私鉄', 'https://www.keio.co.jp/'),
('阪急電鉄', '私鉄', 'https://www.hankyu.co.jp/'),
('阪神電鉄', '私鉄', 'https://www.hanshin.co.jp/');

-- 路線データ
INSERT INTO lines (name, company_id, line_color) VALUES
('山手線', (SELECT id FROM railway_companies WHERE name = 'JR東日本'), '#9ACD32'),
('中央線快速', (SELECT id FROM railway_companies WHERE name = 'JR東日本'), '#F15A22'),
('東海道線', (SELECT id FROM railway_companies WHERE name = 'JR東日本'), '#F68B1E'),
('京浜東北線', (SELECT id FROM railway_companies WHERE name = 'JR東日本'), '#00BFFF'),
('銀座線', (SELECT id FROM railway_companies WHERE name = '東京メトロ'), '#F62E36'),
('丸ノ内線', (SELECT id FROM railway_companies WHERE name = '東京メトロ'), '#F62E36'),
('日比谷線', (SELECT id FROM railway_companies WHERE name = '東京メトロ'), '#B5B5AC'),
('東西線', (SELECT id FROM railway_companies WHERE name = '東京メトロ'), '#009BBF'),
('田園都市線', (SELECT id FROM railway_companies WHERE name = '東急電鉄'), '#8F9A27'),
('東横線', (SELECT id FROM railway_companies WHERE name = '東急電鉄'), '#DA020E');

-- 駅データ（主要駅のみ）
INSERT INTO stations (name, line_id, latitude, longitude, prefecture, city, address, station_code) VALUES
-- JR山手線
('新宿駅', (SELECT id FROM lines WHERE name = '山手線'), 35.6896, 139.7006, '東京都', '新宿区', '東京都新宿区新宿3丁目', 'JY17'),
('渋谷駅', (SELECT id FROM lines WHERE name = '山手線'), 35.6580, 139.7016, '東京都', '渋谷区', '東京都渋谷区道玄坂1丁目', 'JY20'),
('池袋駅', (SELECT id FROM lines WHERE name = '山手線'), 35.7295, 139.7109, '東京都', '豊島区', '東京都豊島区南池袋1丁目', 'JY13'),
('上野駅', (SELECT id FROM lines WHERE name = '山手線'), 35.7133, 139.7770, '東京都', '台東区', '東京都台東区上野7丁目', 'JY05'),
('東京駅', (SELECT id FROM lines WHERE name = '山手線'), 35.6812, 139.7671, '東京都', '千代田区', '東京都千代田区丸の内1丁目', 'JY01'),
('品川駅', (SELECT id FROM lines WHERE name = '山手線'), 35.6284, 139.7387, '東京都', '港区', '東京都港区高輪3丁目', 'JY25'),

-- 東京メトロ銀座線
('銀座駅', (SELECT id FROM lines WHERE name = '銀座線'), 35.6719, 139.7648, '東京都', '中央区', '東京都中央区銀座4丁目', 'G09'),
('表参道駅', (SELECT id FROM lines WHERE name = '銀座線'), 35.6657, 139.7128, '東京都', '港区', '東京都港区北青山3丁目', 'G04'),
('浅草駅', (SELECT id FROM lines WHERE name = '銀座線'), 35.7115, 139.7966, '東京都', '台東区', '東京都台東区浅草1丁目', 'G19'),

-- 東急田園都市線
('二子玉川駅', (SELECT id FROM lines WHERE name = '田園都市線'), 35.6117, 139.6281, '東京都', '世田谷区', '東京都世田谷区玉川2丁目', 'DT07'),
('溝の口駅', (SELECT id FROM lines WHERE name = '田園都市線'), 35.6014, 139.6103, '神奈川県', '川崎市', '神奈川県川崎市高津区溝口1丁目', 'DT10'),
('青葉台駅', (SELECT id FROM lines WHERE name = '田園都市線'), 35.5537, 139.5154, '神奈川県', '横浜市', '神奈川県横浜市青葉区青葉台2丁目', 'DT16');

-- ホームドア設置状況データ
INSERT INTO platform_doors (station_id, platform_number, platform_name, status, installation_date, door_type, manufacturer, notes) VALUES
-- 新宿駅（山手線）
((SELECT id FROM stations WHERE name = '新宿駅' AND line_id = (SELECT id FROM lines WHERE name = '山手線')), '1', '山手線内回り', '設置済み', '2020-07-01', 'フルハイト', '日本信号', '2020年に設置完了'),
((SELECT id FROM stations WHERE name = '新宿駅' AND line_id = (SELECT id FROM lines WHERE name = '山手線')), '2', '山手線外回り', '設置済み', '2020-07-01', 'フルハイト', '日本信号', '2020年に設置完了'),

-- 渋谷駅（山手線）
((SELECT id FROM stations WHERE name = '渋谷駅' AND line_id = (SELECT id FROM lines WHERE name = '山手線')), '1', '山手線内回り', '設置済み', '2019-12-15', 'フルハイト', '京三製作所', '2019年に設置完了'),
((SELECT id FROM stations WHERE name = '渋谷駅' AND line_id = (SELECT id FROM lines WHERE name = '山手線')), '2', '山手線外回り', '設置済み', '2019-12-15', 'フルハイト', '京三製作所', '2019年に設置完了'),

-- 池袋駅（山手線）
((SELECT id FROM stations WHERE name = '池袋駅' AND line_id = (SELECT id FROM lines WHERE name = '山手線')), '1', '山手線内回り', '設置済み', '2018-03-20', 'フルハイト', '日本信号', '2018年に設置完了'),
((SELECT id FROM stations WHERE name = '池袋駅' AND line_id = (SELECT id FROM lines WHERE name = '山手線')), '2', '山手線外回り', '設置済み', '2018-03-20', 'フルハイト', '日本信号', '2018年に設置完了'),

-- 銀座駅（銀座線）
((SELECT id FROM stations WHERE name = '銀座駅' AND line_id = (SELECT id FROM lines WHERE name = '銀座線')), '1', '浅草方面', '設置済み', '2017-05-10', 'フルハイト', '三菱電機', '東京メトロ標準仕様'),
((SELECT id FROM stations WHERE name = '銀座駅' AND line_id = (SELECT id FROM lines WHERE name = '銀座線')), '2', '渋谷方面', '設置済み', '2017-05-10', 'フルハイト', '三菱電機', '東京メトロ標準仕様'),

-- 二子玉川駅（田園都市線）
((SELECT id FROM stations WHERE name = '二子玉川駅' AND line_id = (SELECT id FROM lines WHERE name = '田園都市線')), '1', '渋谷方面', '工事中', NULL, 'フルハイト', '未定', '2024年度設置予定'),
((SELECT id FROM stations WHERE name = '二子玉川駅' AND line_id = (SELECT id FROM lines WHERE name = '田園都市線')), '2', '中央林間方面', '工事中', NULL, 'フルハイト', '未定', '2024年度設置予定'),

-- 溝の口駅（田園都市線）
((SELECT id FROM stations WHERE name = '溝の口駅' AND line_id = (SELECT id FROM lines WHERE name = '田園都市線')), '1', '渋谷方面', '計画中', NULL, 'フルハイト', '未定', '2025年度設置予定'),
((SELECT id FROM stations WHERE name = '溝の口駅' AND line_id = (SELECT id FROM lines WHERE name = '田園都市線')), '2', '中央林間方面', '計画中', NULL, 'フルハイト', '未定', '2025年度設置予定');

-- ニュース記事データ
INSERT INTO news (title, content, summary, status, published_at) VALUES
('JR東日本、山手線全駅でホームドア設置完了', 
'JR東日本は3月15日、山手線全29駅でのホームドア設置が完了したと発表しました。これにより、山手線では全ての駅でホームからの転落事故防止対策が整いました。

設置されたホームドアは全てフルハイト型で、車両のドア位置に合わせて自動開閉します。総工事費は約500億円で、2015年から段階的に設置を進めてきました。

JR東日本では今後、中央線快速や京浜東北線などの主要路線でもホームドア設置を進める予定です。',
'JR東日本が山手線全29駅でのホームドア設置完了を発表。総工事費約500億円。',
'公開',
'2024-03-15 10:00:00+09'),

('東急電鉄、田園都市線でホームドア設置工事開始',
'東急電鉄は3月10日、田園都市線の主要駅でホームドア設置工事を開始したと発表しました。まず二子玉川駅から工事を開始し、順次他の駅にも拡大していく予定です。

設置予定駅は二子玉川駅、溝の口駅、青葉台駅など10駅で、2024年度末までに完了予定です。工事期間中は一部時間帯で運行に影響が出る可能性があります。

東急電鉄では安全性向上のため、今後も積極的にホームドア設置を進めていく方針です。',
'東急電鉄が田園都市線主要駅でホームドア設置工事を開始。2024年度末完了予定。',
'公開',
'2024-03-10 14:30:00+09'),

('大阪メトロ、御堂筋線でホームドア更新工事',
'大阪メトロは3月8日、御堂筋線の既設ホームドアの更新工事を実施すると発表しました。老朽化した設備の更新により、より安全で快適な駅環境を提供します。

更新工事は梅田駅から順次実施し、最新の安全機能を搭載したホームドアに交換します。工事期間は約2年間を予定しています。

新しいホームドアには、より精密なセンサーや緊急時の手動開放機能などが搭載される予定です。',
'大阪メトロが御堂筋線の既設ホームドア更新工事を実施。約2年間の工事期間を予定。',
'公開',
'2024-03-08 16:45:00+09');
