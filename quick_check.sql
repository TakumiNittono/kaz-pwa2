-- クイックチェック: 各テーブルのデータ状況を確認

-- 1. profilesテーブル: ユーザー数と最新の登録
SELECT 
    'profiles' as table_name,
    COUNT(*) as total_count,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM profiles;

-- 2. notificationsテーブル: 通知数と最新の通知
SELECT 
    'notifications' as table_name,
    COUNT(*) as total_count,
    MIN(sent_at) as oldest_notification,
    MAX(sent_at) as newest_notification
FROM notifications;

-- 3. user_notificationsテーブル: 既存の通知履歴
SELECT 
    'user_notifications' as table_name,
    COUNT(*) as total_count,
    COUNT(DISTINCT onesignal_id) as unique_users,
    COUNT(*) FILTER (WHERE step_hours IS NULL) as admin_notifications,
    COUNT(*) FILTER (WHERE step_hours IS NOT NULL) as step_notifications
FROM user_notifications;

-- 4. 移行が必要かどうかの判定
SELECT 
    (SELECT COUNT(*) FROM profiles) as profiles_count,
    (SELECT COUNT(*) FROM notifications) as notifications_count,
    (SELECT COUNT(*) FROM user_notifications WHERE step_hours IS NULL) as existing_user_notifications,
    CASE 
        WHEN (SELECT COUNT(*) FROM profiles) = 0 THEN '❌ profilesテーブルにユーザーが登録されていません'
        WHEN (SELECT COUNT(*) FROM notifications) = 0 THEN '❌ notificationsテーブルに通知がありません'
        WHEN (SELECT COUNT(*) FROM user_notifications WHERE step_hours IS NULL) = 0 THEN '✅ 移行が必要です'
        ELSE '⚠️ 既に一部移行済みです'
    END as migration_status;


