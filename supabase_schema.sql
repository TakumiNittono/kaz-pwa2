-- プロファイルテーブル: 一般ユーザーのOneSignal Player IDを保存
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    onesignal_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知履歴テーブル: 管理者が送信した通知の履歴を保存
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_profiles_onesignal_id ON profiles(onesignal_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);

-- Row Level Security (RLS) の設定
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- profilesテーブル: 全ユーザーが読み取り・書き込み可能（一般ユーザーが自分のIDを登録するため）
CREATE POLICY "Allow public insert on profiles" ON profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on profiles" ON profiles
    FOR SELECT USING (true);

-- notificationsテーブル: 認証済みユーザーのみ読み取り可能、書き込みはAPI経由
CREATE POLICY "Allow authenticated select on notifications" ON notifications
    FOR SELECT USING (auth.role() = 'authenticated');

