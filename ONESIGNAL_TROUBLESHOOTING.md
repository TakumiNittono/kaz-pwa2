# OneSignal API認証エラー解決ガイド

## 🔴 エラーメッセージ

```
{"errors":["Access denied. Please include an 'Authorization: ...' header with a valid API key"]}
```

## ✅ 解決方法

### ステップ1: OneSignal REST API Keyを取得

1. [OneSignal Dashboard](https://dashboard.onesignal.com) にログイン
2. アプリを選択（App ID: `7477e3e2-7f08-40cc-953a-6c418866f1ac`）
3. **Settings** → **Keys & IDs** を開く
4. **REST API Key** を取得：
   - ⚠️ **重要**: セキュリティ上の理由で、既存のREST API Keyは表示されません
   - **新しいキーを作成する必要があります**
   - **「+ Add Key」**ボタンをクリック
   - キー名を入力（例: `kaz-pwa2-production`）
   - **「Create」**をクリック
   - ⚠️ **超重要**: 作成直後に表示されるREST API Keyを**必ずコピー**してください
   - この画面を閉じると、もう一度キーの値を確認することはできません
   - REST API Keyは長い文字列（通常40文字以上）です
   - 例: `YjA2Yz...` のような形式
   - コピーしたキーをVercel環境変数に設定してください

### ステップ2: Vercel環境変数を設定

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. プロジェクト `kaz-pwa2` を選択
3. **Settings** → **Environment Variables** を開く
4. 以下の環境変数を確認/追加：

```env
ONESIGNAL_REST_API_KEY=your_rest_api_key_here
```

**重要**:
- **Key**: `ONESIGNAL_REST_API_KEY`（正確にこの名前）
- **Value**: OneSignalダッシュボードからコピーしたREST API Key
- **Environment**: **Production**（本番環境）にチェック
- **Preview** と **Development** にも設定することを推奨

### ステップ3: 環境変数の確認

設定後、以下の点を確認してください：

1. **環境変数名が正確か**
   - ✅ `ONESIGNAL_REST_API_KEY`（大文字・小文字を正確に）
   - ❌ `ONESIGNAL_REST_API`（間違い）
   - ❌ `onesignal_rest_api_key`（間違い）

2. **値が空でないか**
   - REST API Keyは通常40文字以上の長い文字列です
   - 空文字列や短い値は無効です

3. **環境が正しいか**
   - Production環境に設定されているか確認
   - Preview/Developmentにも設定することを推奨

### ステップ4: 再デプロイ

環境変数を変更した場合は、**必ず再デプロイ**が必要です：

1. Vercelダッシュボードで **Deployments** を開く
2. 最新のデプロイメントを選択
3. **Redeploy** をクリック
4. または、GitHubにプッシュして自動デプロイを待つ

### ステップ5: 動作確認

再デプロイ後、管理者ダッシュボードで通知を送信して確認してください。

## 🔍 トラブルシューティング

### エラーが続く場合

1. **ブラウザの開発者ツールで確認**
   - NetworkタブでAPIリクエストを確認
   - エラーレスポンスの詳細を確認

2. **Vercelのログを確認**
   - Vercelダッシュボード → **Deployments** → 最新のデプロイメント
   - **Functions** タブでログを確認
   - `console.error` の出力を確認

3. **環境変数の再確認**
   - Vercelダッシュボードで環境変数が正しく設定されているか再確認
   - タイポがないか確認
   - 値の前後に余分なスペースがないか確認

4. **OneSignalダッシュボードで確認**
   - REST API Keyが有効か確認
   - アプリが正しく選択されているか確認

## 📝 必要な環境変数一覧

```env
# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID=7477e3e2-7f08-40cc-953a-6c418866f1ac
ONESIGNAL_REST_API_KEY=your_rest_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL
NEXT_PUBLIC_APP_URL=https://kaz-pwa2.vercel.app
```

## ⚠️ 重要な注意点

- `ONESIGNAL_REST_API_KEY` は**秘密鍵**です。Gitにコミットしないでください
- 環境変数を変更した後は**必ず再デプロイ**が必要です
- 環境変数名は**大文字・小文字を正確に**入力してください

