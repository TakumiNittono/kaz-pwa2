# 🌐 アプリケーションのURL一覧

## ローカル開発環境

### 開発サーバーを起動

```bash
npm run dev
```

### アクセスURL

- **トップページ（一般ユーザー向け）**: http://localhost:3000
- **管理者ログイン**: http://localhost:3000/login
- **管理者ダッシュボード**: http://localhost:3000/admin
- **通知送信API**: http://localhost:3000/api/send-notification
- **ステップ配信バッチ**: http://localhost:3000/api/cron/step-mail

## Vercelデプロイ後

### デプロイ後のURL形式

Vercelにデプロイすると、以下のようなURLが自動生成されます：

- **本番環境**: `https://your-project-name.vercel.app`
- **プレビュー環境**: `https://your-project-name-git-branch-username.vercel.app`

### カスタムドメイン設定（オプション）

Vercelダッシュボードでカスタムドメインを設定することもできます：
- Settings → Domains から設定可能

### 各ページのURL（デプロイ後）

- **トップページ**: `https://your-project-name.vercel.app/`
- **管理者ログイン**: `https://your-project-name.vercel.app/login`
- **管理者ダッシュボード**: `https://your-project-name.vercel.app/admin`
- **通知送信API**: `https://your-project-name.vercel.app/api/send-notification`
- **ステップ配信バッチ**: `https://your-project-name.vercel.app/api/cron/step-mail`

## 開発サーバーの起動方法

```bash
# プロジェクトディレクトリで実行
npm run dev
```

起動後、ブラウザで http://localhost:3000 にアクセスしてください。

## Vercelデプロイ後の確認

1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. **Deployments** タブで最新のデプロイを確認
4. デプロイURLをクリックしてアクセス

---

**現在の状態**: 開発サーバーを起動していない場合は、`npm run dev` を実行してください。

