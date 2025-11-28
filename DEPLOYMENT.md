# xサーバーへのデプロイ手順

## 📋 事前準備

1. **xサーバーでNode.jsが利用可能か確認**
   - xサーバーではNode.js環境が利用可能な場合があります
   - 利用できない場合は、Vercel、Netlify、その他のホスティングサービスを推奨

2. **ローカル環境でビルド**
   ```bash
   npm install
   npm run build
   ```

## 📁 アップロードすべきファイル一覧

### ✅ 必須ファイル（すべてアップロード）

```
kaz-pwa2/
├── .next/                    # ビルド成果物（重要！）
├── public/                   # 静的ファイル
│   └── OneSignalSDKWorker.js
├── app/                      # アプリケーションコード
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── login/
│   ├── admin/
│   └── api/
├── utils/                    # ユーティリティ
│   └── supabase/
├── middleware.ts             # 認証ミドルウェア
├── package.json              # 依存関係定義
├── package-lock.json         # 依存関係ロック
├── next.config.js            # Next.js設定
├── tsconfig.json             # TypeScript設定
├── tailwind.config.ts        # Tailwind設定
├── postcss.config.js         # PostCSS設定
└── .env.local                # 環境変数（重要！本番用の値を設定）
```

### ❌ アップロード不要なファイル

```
├── node_modules/             # xサーバー側でnpm installを実行
├── .next/cache/              # キャッシュ（再生成される）
├── .env.local.example        # サンプルファイル
├── .git/                     # Gitリポジトリ
├── .DS_Store                 # macOSの隠しファイル
├── *.log                     # ログファイル
└── README.md                 # ドキュメント（任意）
```

## 🚀 デプロイ手順

### 方法1: ファイルマネージャー経由

1. **ローカルでビルド**
   ```bash
   npm run build
   ```

2. **以下のファイル・フォルダをアップロード**
   - `.next/` フォルダ全体
   - `public/` フォルダ全体
   - `app/` フォルダ全体
   - `utils/` フォルダ全体
   - `middleware.ts`
   - `package.json`
   - `package-lock.json`
   - `next.config.js`
   - `tsconfig.json`
   - `tailwind.config.ts`
   - `postcss.config.js`
   - `.env.local`（本番環境変数を設定したもの）

3. **xサーバー側で依存関係をインストール**
   ```bash
   npm install --production
   ```

4. **環境変数の設定**
   - xサーバーの管理画面で環境変数を設定
   - または `.env.local` ファイルを配置

5. **サーバー起動**
   ```bash
   npm start
   ```

### 方法2: SSH経由（推奨）

1. **SSHでxサーバーに接続**
   ```bash
   ssh username@yourdomain.com
   ```

2. **プロジェクトディレクトリに移動**
   ```bash
   cd /home/username/public_html/your-app
   ```

3. **ファイルをアップロード**
   - `scp`、`rsync`、または`git clone`を使用
   ```bash
   rsync -avz --exclude 'node_modules' --exclude '.git' ./ user@server:/path/to/app/
   ```

4. **依存関係のインストールとビルド**
   ```bash
   npm install --production
   npm run build
   ```

5. **環境変数の設定**
   ```bash
   # .env.localファイルを編集
   nano .env.local
   ```

6. **プロセスマネージャーの設定（PM2など）**
   ```bash
   npm install -g pm2
   pm2 start npm --name "kaz-pwa2" -- start
   pm2 save
   pm2 startup
   ```

## ⚙️ xサーバーでの環境変数設定

xサーバーの管理画面で環境変数を設定するか、`.env.local`ファイルに以下を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key
NODE_ENV=production
```

## 📝 注意事項

1. **ポート番号**: xサーバーでは通常3000番ポートが使えないため、環境変数でポートを指定
   ```env
   PORT=8080
   ```
   または`package.json`のstartスクリプトを変更：
   ```json
   "start": "next start -p 8080"
   ```

2. **HTTPS**: xサーバーでSSL証明書を設定し、HTTPSでアクセス可能にする

3. **OneSignal設定**: 本番環境のURLをOneSignalダッシュボードに登録

4. **Cron設定**: xサーバーのCron機能を使って、`/api/cron/step-mail`を定期実行
   ```bash
   0 0 * * * curl https://yourdomain.com/api/cron/step-mail
   ```

## 🔄 より簡単な代替案

xサーバーでのデプロイが困難な場合、以下を推奨：

- **Vercel**（Next.js公式ホスティング、無料プランあり）
- **Netlify**（無料プランあり）
- **Railway**（無料クレジットあり）
- **Render**（無料プランあり）

これらのサービスでは、GitHubリポジトリと連携して自動デプロイが可能です。

