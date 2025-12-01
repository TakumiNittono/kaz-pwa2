-- OneSignalから取得したPlayer IDを使ってユーザーを追加・更新するSQL

-- 複数のデバイス/ユーザーでテストした場合、複数のPlayer IDを追加できます

-- 例: 実際のPlayer IDを複数追加（既存のプレースホルダーを削除して新しいIDを追加）
-- DELETE FROM profiles WHERE onesignal_id = 'your-onesignal-player-id-here';

-- INSERT INTO profiles (onesignal_id, created_at)
-- VALUES 
--     ('実際のPlayer-ID-1', NOW()),
--     ('実際のPlayer-ID-2', NOW()),
--     ('実際のPlayer-ID-3', NOW())
-- ON CONFLICT (onesignal_id) DO UPDATE
-- SET created_at = EXCLUDED.created_at;

-- 現在のprofilesテーブルの内容を確認
SELECT 
    id,
    onesignal_id,
    created_at,
    CASE 
        WHEN onesignal_id = 'your-onesignal-player-id-here' THEN '⚠️ プレースホルダー（要更新）'
        ELSE '✅ 有効なID'
    END as status
FROM profiles
ORDER BY created_at DESC;


