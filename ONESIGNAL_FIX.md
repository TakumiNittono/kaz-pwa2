# OneSignal設定ガイド

## 🌐 ドメイン設定: https://kaz-pwa2.vercel.app

現在の本番ドメインは **`https://kaz-pwa2.vercel.app`** です。

## ✅ OneSignalダッシュボードでの設定手順

### ステップ1: OneSignalダッシュボードにログイン

1. [OneSignal Dashboard](https://dashboard.onesignal.com) にログイン
2. アプリを選択（App ID: `7477e3e2-7f08-40cc-953a-6c418866f1ac`）

### ステップ2: Web Push設定を更新

1. **Settings** → **Platforms** → **Web Push** を開く
2. **Web Configuration** セクションを確認
3. **Section 1: Site Name** を確認・更新:
   - **SITE NAME**: `kaz-pwa2.vercel.app` または任意の名前
4. **Section 2: Site URL** を更新:
   - **SITE URL**: `https://kaz-pwa2.vercel.app`
   - ⚠️ **重要**: 末尾のスラッシュ（`/`）は付けない
5. **保存** ボタンをクリック

### ステップ3: 設定の確認

- **Section 6**: Service Workerファイルがアップロードされているか確認
- **Section 7**: コードがサイトに追加されているか確認（`app/layout.tsx`で設定済み）

## 🔧 Vercel環境変数の設定

Vercelダッシュボードで以下の環境変数を設定してください：

1. **Vercelダッシュボード** → **プロジェクト** → **Settings** → **Environment Variables**
2. 以下の環境変数を追加/更新：

```env
NEXT_PUBLIC_APP_URL=https://kaz-pwa2.vercel.app
NEXT_PUBLIC_ONESIGNAL_APP_ID=7477e3e2-7f08-40cc-953a-6c418866f1ac
ONESIGNAL_REST_API_KEY=your_rest_api_key_here
```

### 環境変数の設定場所

- **Production**: 本番環境用
- **Preview**: プレビュー環境用（必要に応じて）
- **Development**: 開発環境用（通常は不要）

## ⚠️ 重要な注意点

1. **OneSignalの設定変更は反映に数分かかる場合があります**
2. **ブラウザのキャッシュをクリア**してから再試行してください
3. **Service Workerファイル** (`OneSignalSDKWorker.js`) が `public` ディレクトリに配置されていることを確認
4. **HTTPS必須**: プッシュ通知はHTTPS環境でのみ動作します（Vercelは自動的にHTTPSを提供）

## 🚀 設定後の確認手順

1. OneSignalダッシュボードで設定を保存
2. Vercelの環境変数を確認・更新
3. Vercelで再デプロイ（環境変数を変更した場合）
4. ブラウザで `https://kaz-pwa2.vercel.app` にアクセス
5. PWAとしてホーム画面に追加
6. 通知許可をリクエスト
7. 通知が正常に動作するか確認

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

