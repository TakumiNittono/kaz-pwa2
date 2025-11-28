# 🚀 動作確認チェックリスト

## ✅ ビルド確認
- [x] `npm run build` - 成功しました！

## ⚠️ まだ必要な設定

### 1. 環境変数の設定（開発環境）

`.env.local`ファイルを作成して、環境変数を設定してください：

```bash
# サンプルファイルをコピー
cp .env.local.example .env.local

# 実際の値を設定（エディタで編集）
# .env.local
```

必要な環境変数：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ONESIGNAL_APP_ID`
- `ONESIGNAL_REST_API_KEY`

### 2. Supabaseデータベースのセットアップ

1. Supabaseプロジェクトを作成
2. `supabase_schema.sql`の内容をSQLエディタで実行
3. 管理者アカウントを作成（Auth → Users）

### 3. OneSignalの設定

1. OneSignalアカウントでアプリを作成
2. Webプラットフォームを設定
3. App IDとREST API Keyを取得

## 🧪 動作確認

### 開発サーバーを起動

```bash
npm run dev
```

### 確認すべき項目

1. **トップページ** (`http://localhost:3000`)
   - [ ] ページが表示される
   - [ ] 「通知を受け取る」ボタンが表示される
   - [ ] ボタンをクリックして通知許可が動作する（環境変数設定後）

2. **管理者ログイン** (`http://localhost:3000/login`)
   - [ ] ログインフォームが表示される
   - [ ] ログインが動作する（Supabase設定後）

3. **管理者ダッシュボード** (`http://localhost:3000/admin`)
   - [ ] ログイン後にアクセスできる
   - [ ] 通知送信フォームが表示される

## 🚀 Vercelデプロイ準備

環境変数が設定できたら、Vercelにデプロイできます：

1. GitHubにプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数をVercelダッシュボードで設定
4. デプロイ完了！

詳細は `VERCEL_QUICKSTART.md` を参照してください。

