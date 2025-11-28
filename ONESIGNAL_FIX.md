# OneSignal設定エラー修正ガイド

## 🔴 問題

エラーメッセージ：
```
This web push config can only be used on https://kazzz.online. 
Your current origin is https://kaz-pwa2.vercel.app.
```

## ✅ 解決方法

### 方法1: 既存のサイト設定にドメインを追加（推奨）

1. **OneSignalダッシュボードにログイン**
2. **アプリを選択**
3. **Settings** → **Platforms** → **Web Push** を開く
4. **Site URL** の設定を確認
5. **複数のドメインを設定する場合**:
   - 既存のサイト設定を編集
   - **Site URL** に `https://kaz-pwa2.vercel.app` を追加
   - または、カンマ区切りで複数のURLを設定: `https://kazzz.online,https://kaz-pwa2.vercel.app`

### 方法2: 新しいサイト設定を作成

1. **OneSignalダッシュボードにログイン**
2. **アプリを選択**
3. **Settings** → **Platforms** → **Web Push** を開く
4. **新しいサイト設定を作成**:
   - **SITE NAME**: `kaz-pwa2.vercel.app`
   - **SITE URL**: `https://kaz-pwa2.vercel.app`
   - その他の設定を入力
5. **保存**

### 方法3: 新しいApp IDを使用（完全に分離したい場合）

1. **OneSignalダッシュボードで新しいアプリを作成**
2. **Web Pushプラットフォームを設定**:
   - **SITE NAME**: `kaz-pwa2.vercel.app`
   - **SITE URL**: `https://kaz-pwa2.vercel.app`
3. **新しいApp IDを取得**
4. **Vercelの環境変数を更新**:
   - `NEXT_PUBLIC_ONESIGNAL_APP_ID` を新しいApp IDに変更
   - 再デプロイ

## 🔧 コードの変更

`react-onesignal`から直接OneSignal SDKを使用するように変更しました：

- ✅ `app/page.tsx` - 直接OneSignal SDKを使用
- ✅ `app/layout.tsx` - OneSignal SDKスクリプトを追加

## 📋 確認事項

1. **OneSignalダッシュボードで設定を保存**
2. **Vercelの環境変数を確認**:
   - `NEXT_PUBLIC_ONESIGNAL_APP_ID` が正しく設定されているか
3. **ブラウザのキャッシュをクリア**
4. **ページを再読み込み**

## ⚠️ 重要な注意点

- OneSignalの設定変更は**即座に反映されない場合があります**（数分かかることも）
- ブラウザのキャッシュをクリアしてから再試行してください
- 開発環境（localhost）では `allowLocalhostAsSecureOrigin: true` が必要です

## 🚀 次のステップ

1. OneSignalダッシュボードで設定を確認・修正
2. 変更をコミット・プッシュ
3. Vercelで再デプロイ
4. ブラウザで動作確認

