-- 既存のnotificationsテーブルのデータをuser_notificationsテーブルに移行
-- 注意: このスクリプトは過去に送信された通知を全ユーザーの通知履歴に追加します

-- 既存のnotificationsテーブルから全通知を取得し、
-- 現在登録されている全ユーザーのuser_notificationsテーブルに追加
INSERT INTO user_notifications (onesignal_id, title, message, url, step_hours, sent_at, created_at)
SELECT 
    p.onesignal_id,
    n.title,
    n.message,
    NULL as url,  -- 過去の通知にはURLがなかったのでNULL
    NULL as step_hours,  -- ステップ配信ではない
    n.sent_at,
    n.sent_at as created_at
FROM 
    notifications n
CROSS JOIN 
    profiles p
WHERE 
    -- 既に同じ通知がuser_notificationsに存在しないことを確認
    NOT EXISTS (
        SELECT 1 
        FROM user_notifications un 
        WHERE un.onesignal_id = p.onesignal_id 
        AND un.title = n.title 
        AND un.message = n.message 
        AND un.sent_at = n.sent_at
    )
ORDER BY 
    n.sent_at, p.onesignal_id;

-- 移行が完了したことを確認するクエリ
-- SELECT 
--     COUNT(*) as total_notifications_in_notifications_table,
--     (SELECT COUNT(DISTINCT onesignal_id) FROM user_notifications WHERE step_hours IS NULL) as total_user_notifications,
--     (SELECT COUNT(DISTINCT onesignal_id) FROM profiles) as total_users
-- FROM notifications;

