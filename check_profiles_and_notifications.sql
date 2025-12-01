-- profilesテーブルとnotificationsテーブルのデータを確認するSQLクエリ

-- 1. profilesテーブルのデータ件数を確認
SELECT 
    COUNT(*) as total_profiles,
    COUNT(DISTINCT onesignal_id) as unique_users
FROM profiles;

-- 2. notificationsテーブルのデータ件数を確認
SELECT 
    COUNT(*) as total_notifications
FROM notifications;

-- 3. user_notificationsテーブルのデータ件数を確認
SELECT 
    COUNT(*) as total_user_notifications,
    COUNT(DISTINCT onesignal_id) as unique_users_with_notifications
FROM user_notifications;

-- 4. profilesテーブルの最新10件を表示
SELECT 
    onesignal_id,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 5. notificationsテーブルの最新10件を表示
SELECT 
    id,
    title,
    message,
    sent_at
FROM notifications
ORDER BY sent_at DESC
LIMIT 10;

-- 6. 移行が必要な通知があるか確認
-- (profilesにユーザーがいて、notificationsに通知があるか)
SELECT 
    (SELECT COUNT(*) FROM profiles) as profiles_count,
    (SELECT COUNT(*) FROM notifications) as notifications_count,
    (SELECT COUNT(*) FROM profiles) * (SELECT COUNT(*) FROM notifications) as expected_migration_count,
    (SELECT COUNT(*) FROM user_notifications WHERE step_hours IS NULL) as existing_user_notifications_count;

-- 7. 重複チェック: 既に移行済みかどうかを確認
-- このクエリは、notificationsとuser_notificationsの組み合わせを確認します
SELECT 
    n.id as notification_id,
    n.title,
    n.sent_at,
    COUNT(un.id) as already_migrated_count
FROM notifications n
LEFT JOIN user_notifications un ON 
    un.title = n.title 
    AND un.message = n.message 
    AND un.sent_at = n.sent_at
GROUP BY n.id, n.title, n.sent_at
ORDER BY n.sent_at DESC;


