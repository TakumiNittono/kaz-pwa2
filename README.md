# コーチング用プッシュ通知アプリ

Next.js (App Router)、Supabase、OneSignalを使用したプッシュ通知配信アプリです。

## 機能

- **一般ユーザー**: 登録不要で、通知許可ボタンを押すだけでPlayer IDがDBに保存され、ステップ配信の対象となる
- **管理者**: 専用URLからログインし、全ユーザーへの一斉通知を行う
- **自動化**: Cron処理により、登録から3日が経過したユーザーへ自動でメッセージを送る

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key
```

### 3. Supabaseデータベースのセットアップ

1. SupabaseのSQLエディタにアクセス
2. 以下のテーブルを作成してください：
   - `profiles`: 一般ユーザーのOneSignal Player IDを保存
   - `notifications`: 管理者が送信した通知の履歴を保存
   
   テーブル構造はSupabaseダッシュボードで直接作成するか、既存のスキーマを参照してください。

### 4. OneSignalの設定

1. OneSignalダッシュボードでアプリを作成
2. Webプラットフォームを設定
3. `NEXT_PUBLIC_ONESIGNAL_APP_ID` と `ONESIGNAL_REST_API_KEY` を取得して環境変数に設定

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

## 使用方法

### 一般ユーザー

1. トップページ（`/`）にアクセス
2. 「通知を受け取る」ボタンをクリック
3. 通知許可を選択すると、Player IDが自動的にDBに保存されます

### 管理者

1. `/login` にアクセスしてログイン
2. `/admin` にアクセスしてダッシュボードを開く
3. 「タイトル」と「本文」を入力して「通知を送信する」ボタンをクリック
4. 通知が全ユーザーに配信されます

### ステップ配信（Cron）

3日前に登録したユーザーに対して自動的にメッセージを送信するには、以下のエンドポイントを呼び出します：

```bash
GET /api/cron/step-mail
```

このエンドポイントは、外部のCronサービス（Vercel Cron、GitHub Actions等）から定期的に呼び出すことができます。

## プロジェクト構造

```
kaz-pwa2/
├── app/
│   ├── page.tsx              # 一般ユーザー向けトップページ
│   ├── login/
│   │   └── page.tsx          # 管理者ログインページ
│   ├── admin/
│   │   └── page.tsx          # 管理者ダッシュボード
│   ├── api/
│   │   ├── send-notification/
│   │   │   └── route.ts      # 通知送信API
│   │   └── cron/
│   │       └── step-mail/
│   │           └── route.ts  # ステップ配信バッチ
│   ├── layout.tsx            # ルートレイアウト
│   └── globals.css           # グローバルスタイル
├── utils/
│   └── supabase/
│       ├── client.ts         # ブラウザ用Supabaseクライアント
│       └── server.ts         # サーバー用Supabaseクライアント
├── public/
│   └── OneSignalSDKWorker.js # OneSignal Service Worker
├── middleware.ts             # 認証保護ミドルウェア
└── package.json
```

## 技術スタック

- **Next.js 14**: App Routerを使用
- **Supabase**: データベースと認証
- **OneSignal**: プッシュ通知配信
- **TypeScript**: 型安全性
- **Tailwind CSS**: スタイリング

## デプロイ

### Vercelへのデプロイ（推奨）

**VercelはNext.jsアプリに最適で、セキュリティーも強力です！**

詳細な手順は `VERCEL_DEPLOYMENT.md` を参照してください。

#### 簡単な手順：

1. **GitHubにプッシュ**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Vercelでプロジェクトをインポート**
   - [Vercel](https://vercel.com)にアクセス
   - GitHubアカウントでログイン
   - リポジトリをインポート

3. **環境変数を設定**
   - Vercelダッシュボードで環境変数を追加

4. **デプロイ**
   - 自動でデプロイされます！

#### Vercelのメリット：

- ✅ **自動HTTPS/TLS暗号化** - すべての通信が自動的に暗号化
- ✅ **ゼロ設定デプロイ** - 追加設定不要
- ✅ **自動デプロイ** - GitHubにプッシュするだけでデプロイ
- ✅ **DDoS保護** - 自動的な攻撃対策
- ✅ **高速CDN** - 世界中から高速アクセス
- ✅ **Vercel Cron** - ステップ配信を自動実行
- ✅ **無料プラン** - 個人プロジェクトなら無料で十分

詳細は `VERCEL_DEPLOYMENT.md` を参照してください。

### その他のホスティング

- xサーバーなどのレンタルサーバー: `DEPLOYMENT.md` を参照
- Netlify, Railway, Render なども利用可能

## 注意事項

- OneSignal SDK Worker (`OneSignalSDKWorker.js`) は `public` ディレクトリに配置されています
- 管理者の認証はSupabase Authを使用しています。管理者アカウントを事前に作成してください
- ステップ配信のCronエンドポイントは、Vercel Cron使用時は自動的に保護されます
- 手動実行する場合は、`CRON_SECRET` 環境変数を設定して認証ヘッダーを追加してください

## ライセンス

MIT

