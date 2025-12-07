# Vercelデプロイ クイックスタート

## 🚀 3ステップでデプロイ完了！

### ステップ1: GitHubにプッシュ

```bash
# リポジトリを初期化（まだの場合）
git init

# すべてのファイルを追加
git add .

# コミット
git commit -m "Initial commit - Ready for Vercel"

# GitHubでリポジトリを作成後、以下を実行
git remote add origin https://github.com/yourusername/kaz-pwa2.git
git branch -M main
git push -u origin main
```

### ステップ2: Vercelでプロジェクトをインポート

1. **[Vercel](https://vercel.com)** にアクセス
2. **Sign Up** をクリック（GitHubアカウントで登録推奨）
3. **Add New Project** をクリック
4. GitHubリポジトリ `kaz-pwa2` を選択
5. **Import** をクリック

### ステップ3: 環境変数を設定

プロジェクト設定画面で、以下の環境変数を追加してください：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key
```

**デプロイボタンをクリック** → 数分で完了！

---

## ✅ Vercel向け最適化済み機能

このプロジェクトは、Vercel向けに最適化されています：

- ✅ **セキュリティヘッダー** - 自動的に設定済み
- ✅ **Vercel Cron** - ステップ配信を自動実行（毎日0時）
- ✅ **タイムアウト設定** - APIルートに最適な設定
- ✅ **XSS対策** - 入力値のサニタイゼーション
- ✅ **エラーハンドリング** - 適切なエラーレスポンス

---

## 🔧 環境変数の取得方法

### Supabase

1. [Supabase](https://supabase.com) にログイン
2. プロジェクトを選択
3. Settings → API から以下を取得：
   - `NEXT_PUBLIC_SUPABASE_URL` - Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - service_role key（重要：秘密）

### OneSignal

1. [OneSignal](https://onesignal.com) にログイン
2. アプリを選択
3. Settings → Keys & IDs から取得：
   - `NEXT_PUBLIC_ONESIGNAL_APP_ID` - App ID
   - `ONESIGNAL_REST_API_KEY` - REST API Key（重要：秘密）

---

## 🎯 デプロイ後の確認事項

1. ✅ アプリが正常に動作するか確認
2. ✅ 通知許可ボタンが動作するか確認
3. ✅ 管理者ログインが動作するか確認
4. ✅ OneSignalダッシュボードで本番URLを許可リストに追加
5. ✅ Cronが動作するか確認（翌日または手動実行）

---

## 📝 手動でCronを実行する場合

```bash
# Vercel CLIを使用
vercel env pull .env.local
curl -X GET https://your-domain.vercel.app/api/cron/step-mail

# または、認証ヘッダー付きで実行（CRON_SECRET設定済みの場合）
curl -X GET https://your-domain.vercel.app/api/cron/step-mail \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🔄 次のデプロイ

GitHubにプッシュするだけで、自動的にデプロイされます：

```bash
git add .
git commit -m "Update features"
git push origin main
```

Vercelが自動的に：
- ✅ 変更を検出
- ✅ ビルドを実行
- ✅ デプロイを完了
- ✅ プレビューURLを生成

---

## 🆘 トラブルシューティング

### ビルドエラーが発生する場合

1. Vercelダッシュボードで「Deployments」を確認
2. ビルドログを確認
3. 環境変数が正しく設定されているか確認

### 環境変数が読み込まれない場合

1. Vercelダッシュボード → Settings → Environment Variables
2. 各環境（Production, Preview, Development）に設定されているか確認
3. 再デプロイを実行

### OneSignalが動作しない場合

1. OneSignalダッシュボードで本番URLを許可リストに追加
2. `NEXT_PUBLIC_ONESIGNAL_APP_ID` が正しく設定されているか確認
3. ブラウザのコンソールでエラーを確認

---

## 📚 詳細情報

- 詳細なデプロイ手順: `VERCEL_DEPLOYMENT.md`
- プロジェクト全体の説明: `README.md`

---

**Happy Deploying! 🎉**

