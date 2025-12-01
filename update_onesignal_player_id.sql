-- 実際のOneSignal Player IDに更新するSQL

-- 方法1: 既存のレコードを更新
-- OneSignalダッシュボードでPlayer IDを取得して、以下のように更新してください

-- UPDATE profiles
-- SET onesignal_id = '実際のPlayer-IDをここに貼り付け'
-- WHERE onesignal_id = 'your-onesignal-player-id-here';

-- 例:
-- UPDATE profiles
-- SET onesignal_id = '12345678-1234-1234-1234-123456789012'
-- WHERE onesignal_id = 'your-onesignal-player-id-here';

-- 方法2: OneSignalダッシュボードからPlayer IDを取得する手順
-- 1. OneSignalダッシュボードにログイン
-- 2. 左メニューから「Audience」→「All Users」を選択
-- 3. ユーザーリストから、通知を許可したデバイスのPlayer IDをコピー
--    または、「Settings」→「Keys & IDs」から確認
-- 4. 上記のUPDATE文のPlayer ID部分を実際のIDに置き換えて実行

-- 更新後の確認
SELECT * FROM profiles ORDER BY created_at DESC;


