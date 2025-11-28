-- ユーザー通知履歴テーブル: 各ユーザーに送信された通知の履歴を保存
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    onesignal_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    url TEXT,
    step_hours INTEGER,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_user_notifications_onesignal_id ON user_notifications(onesignal_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_sent_at ON user_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read_at ON user_notifications(read_at);

-- Row Level Security (RLS) の設定
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Allow users to read own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Allow system to insert notifications" ON user_notifications;
DROP POLICY IF EXISTS "Allow users to update own notifications" ON user_notifications;

-- user_notificationsテーブル: ユーザーは自分の通知のみ読み取り可能
CREATE POLICY "Allow users to read own notifications" ON user_notifications
    FOR SELECT USING (
        onesignal_id IN (
            SELECT onesignal_id FROM profiles WHERE onesignal_id = user_notifications.onesignal_id
        )
    );

-- user_notificationsテーブル: システム（API）が通知を挿入可能
CREATE POLICY "Allow system to insert notifications" ON user_notifications
    FOR INSERT WITH CHECK (true);

-- user_notificationsテーブル: ユーザーは自分の通知を更新可能（既読マークなど）
CREATE POLICY "Allow users to update own notifications" ON user_notifications
    FOR UPDATE USING (
        onesignal_id IN (
            SELECT onesignal_id FROM profiles WHERE onesignal_id = user_notifications.onesignal_id
        )
    );

