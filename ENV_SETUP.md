# 環境変数の設定方法

## 📝 `.env.local`ファイルについて

`.env.local`は**開発環境専用**の環境変数ファイルです。

### ⚠️ 重要なポイント

- ✅ **開発環境では必須** - `npm run dev`で動作させるために必要
- ❌ **Gitにコミットしない** - `.gitignore`で除外されています（セキュリティ上の理由）
- ✅ **Vercelでは別途設定** - ダッシュボードで環境変数を設定します

---

## 🔧 開発環境での設定方法

### ステップ1: `.env.local`ファイルを作成

プロジェクトルートに`.env.local`ファイルを作成してください：

```bash
# ターミナルで実行
touch .env.local
```

### ステップ2: 環境変数を設定

`.env.local.example`ファイルを参考に、実際の値を設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OneSignal設定
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_app_id_here
ONESIGNAL_REST_API_KEY=your_rest_api_key_here

# アプリURL設定（本番環境）
NEXT_PUBLIC_APP_URL=https://kaz-pwa2.vercel.app
```

### ステップ3: 値を取得

#### Supabaseから取得

1. [Supabase](https://supabase.com) にログイン
2. プロジェクトを選択
3. **Settings** → **API** を開く
4. 以下をコピー：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`（⚠️ 秘密鍵）

#### OneSignalから取得

1. [OneSignal](https://onesignal.com) にログイン
2. アプリを選択
3. **Settings** → **Keys & IDs** を開く
4. 以下をコピー：
   - **App ID** → `NEXT_PUBLIC_ONESIGNAL_APP_ID`
   - **REST API Key** → `ONESIGNAL_REST_API_KEY`（⚠️ 秘密鍵）

---

## 🚀 Vercelでの設定（本番環境）

Vercelにデプロイする場合、**`.env.local`ファイルは不要**です。

代わりに、Vercelダッシュボードで環境変数を設定します：

1. Vercelプロジェクトを開く
2. **Settings** → **Environment Variables** を開く
3. 以下の環境変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_ONESIGNAL_APP_ID
ONESIGNAL_REST_API_KEY
NEXT_PUBLIC_APP_URL=https://kaz-pwa2.vercel.app
```

4. 各環境（Production, Preview, Development）に設定
5. 保存

---

## 🔒 セキュリティの注意点

### ✅ して良いこと

- `.env.local`ファイルをローカルで使用する
- `.env.local.example`をGitにコミットする（実際の値は含めない）

### ❌ してはいけないこと

- `.env.local`ファイルをGitにコミットする
- 環境変数をコードに直接書く
- 秘密鍵（`SUPABASE_SERVICE_ROLE_KEY`, `ONESIGNAL_REST_API_KEY`）を公開する

---

## ✅ 確認方法

開発サーバーを起動して、環境変数が正しく読み込まれているか確認：

```bash
npm run dev
```

エラーが表示されなければ、環境変数は正しく設定されています。

---

## 📋 まとめ

| 環境 | 設定方法 | ファイル |
|------|----------|----------|
| **開発環境** | `.env.local`ファイルを作成 | `.env.local` |
| **Vercel（本番）** | ダッシュボードで設定 | 不要 |

開発環境では`.env.local`が必要ですが、Vercelではダッシュボードで環境変数を設定するため、ファイルは不要です！

