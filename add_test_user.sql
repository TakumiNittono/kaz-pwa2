-- テスト用ユーザーをprofilesテーブルに追加
-- 注意: 実際のOneSignal Player IDが必要です

-- 方法1: OneSignalダッシュボードからPlayer IDを取得して追加
-- OneSignalダッシュボード → Settings → Keys & IDs → User ID (Player ID) をコピーして使用

-- 例: テストユーザーを追加
INSERT INTO profiles (onesignal_id, created_at)
VALUES 
    ('your-onesignal-player-id-here', NOW())
ON CONFLICT (onesignal_id) DO NOTHING;

-- 方法2: 既存のOneSignalユーザーを確認
-- OneSignalダッシュボード → Audience → All Users から Player ID を確認できます

-- 複数のテストユーザーを追加する場合（複数のデバイスでテストした場合）
-- INSERT INTO profiles (onesignal_id, created_at)
-- VALUES 
--     ('player-id-1', NOW()),
--     ('player-id-2', NOW()),
--     ('player-id-3', NOW())
-- ON CONFLICT (onesignal_id) DO NOTHING;

-- 追加したユーザーを確認
SELECT * FROM profiles ORDER BY created_at DESC;


