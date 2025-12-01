-- profilesテーブルへの挿入が正しく動作するか確認するSQL

-- 1. RLSポリシーを確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 2. profilesテーブルの構造を確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. 現在のprofilesデータを確認
SELECT 
    id,
    onesignal_id,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- 4. テスト用の一時的なユーザーを追加（実際のPlayer IDに置き換えてください）
-- INSERT INTO profiles (onesignal_id)
-- VALUES ('test-player-id-123456789')
-- ON CONFLICT (onesignal_id) DO NOTHING
-- RETURNING *;


