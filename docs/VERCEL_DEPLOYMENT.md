# Vercelへのデプロイ手順（推奨）

## 🚀 Vercelを選ぶ理由

### ✅ **セキュリティーの優位性**

1. **自動HTTPS/TLS暗号化**
   - すべての通信が自動的にHTTPSで暗号化
   - 無料でSSL証明書を提供
   - セキュアな接続を自動維持

2. **環境変数の安全な管理**
   - 暗号化された環境変数ストレージ
   - 本番・開発環境で分離管理
   - Gitリポジトリに環境変数をコミットする必要なし

3. **DDoS保護**
   - 自動的なDDoS攻撃対策
   - CDNによる分散配信で負荷分散

4. **ISO 27001認証取得**
   - 国際的なセキュリティ標準に準拠
   - 定期的なセキュリティ監査

### ✅ **便利な機能**

1. **ゼロ設定デプロイ**
   - Next.jsが自動検出され、最適設定を自動適用
   - 追加設定不要で即座にデプロイ可能

2. **自動デプロイ**
   - GitHub/GitLabと連携
   - プッシュするたびに自動デプロイ
   - プレビューデプロイで変更を確認可能

3. **高速なグローバルCDN**
   - 世界中に分散されたエッジネットワーク
   - ユーザーの近くから配信され、高速アクセス

4. **無料プランが充実**
   - 個人プロジェクトなら無料で十分
   - 月100GBの帯域幅
   - 無制限のデプロイ

5. **Vercel Cron**
   - ステップ配信バッチを自動実行
   - 追加設定で定期実行可能

## 📋 デプロイ手順

### 方法1: GitHub経由（推奨）

#### 1. GitHubリポジトリを作成

```bash
# Gitリポジトリを初期化（まだの場合）
git init

# .gitignoreを確認（既に含まれているはず）
# .env.local などが除外されているか確認

# ファイルをコミット
git add .
git commit -m "Initial commit"

# GitHubにリポジトリを作成してプッシュ
# GitHubのWebサイトでリポジトリを作成後：
git remote add origin https://github.com/yourusername/kaz-pwa2.git
git branch -M main
git push -u origin main
```

#### 2. Vercelでプロジェクトをインポート

1. [Vercel](https://vercel.com)にアクセス
2. **Sign Up**（GitHubアカウントで登録可能）
3. **Add New Project** をクリック
4. GitHubリポジトリを選択（`kaz-pwa2`）
5. **Import** をクリック

#### 3. 環境変数を設定

プロジェクト設定画面で、以下の環境変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key
```

**重要**: 
- `NEXT_PUBLIC_*` はクライアント側でも利用可能（公開されるため注意）
- `SUPABASE_SERVICE_ROLE_KEY` や `ONESIGNAL_REST_API_KEY` は秘密キーなので `NEXT_PUBLIC_` を付けない

#### 4. デプロイ実行

**Deploy** ボタンをクリック。数分でデプロイが完了します。

### 方法2: Vercel CLI経由

#### 1. Vercel CLIをインストール

```bash
npm install -g vercel
```

#### 2. ログイン

```bash
vercel login
```

#### 3. デプロイ

```bash
# プロジェクトディレクトリで実行
vercel

# 初回デプロイ時は設定を聞かれます：
# - Set up and deploy? [Y/n] → Y
# - Which scope? → あなたのアカウントを選択
# - Link to existing project? [y/N] → N（新規プロジェクト）
# - Project name? → kaz-pwa2（任意）
# - Directory? → ./
```

#### 4. 環境変数を設定

```bash
# 各環境変数を設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_ONESIGNAL_APP_ID
vercel env add ONESIGNAL_REST_API_KEY
```

#### 5. 本番環境に再デプロイ

```bash
vercel --prod
```

## ⏰ Cron設定（ステップ配信の自動化）

### Vercel Cronを使用（推奨）

`vercel.json` ファイルが既に作成されています：

```json
{
  "crons": [
    {
      "path": "/api/cron/step-mail",
      "schedule": "0 0 * * *"
    }
  ]
}
```

この設定により、毎日午前0時にステップ配信が自動実行されます。

**スケジュールの変更**:
- `"0 0 * * *"` - 毎日0時
- `"0 9 * * *"` - 毎日9時
- `"0 */6 * * *"` - 6時間ごと
- `"0 0 * * 1"` - 毎週月曜日0時

### Cronエンドポイントのセキュリティ強化

Cronエンドポイントに認証を追加する場合、`app/api/cron/step-mail/route.ts` を修正：

```typescript
// Vercel Cronからのリクエストか確認
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

`vercel.json` に認証ヘッダーを追加：

```json
{
  "crons": [
    {
      "path": "/api/cron/step-mail",
      "schedule": "0 0 * * *",
      "headers": {
        "Authorization": "Bearer YOUR_CRON_SECRET"
      }
    }
  ]
}
```

## 🔒 セキュリティのベストプラクティス

### 1. 環境変数の管理

- ✅ Vercelのダッシュボードで環境変数を設定
- ✅ `NEXT_PUBLIC_*` はクライアント側で公開されるため、秘密情報を含めない
- ✅ 本番環境と開発環境で環境変数を分離

### 2. APIルートの保護

- ✅ 管理者ダッシュボードは既にMiddlewareで保護済み
- ✅ Cronエンドポイントに認証を追加（推奨）

### 3. OneSignal設定

- ✅ OneSignalダッシュボードで本番URLを許可リストに追加
- ✅ 開発環境と本番環境で異なるOneSignal App IDを使用（推奨）

### 4. Supabase設定

- ✅ Row Level Security (RLS) が有効になっていることを確認
- ✅ Service Role Keyはサーバー側でのみ使用

## 📊 デプロイ後の確認事項

1. ✅ HTTPSが有効か確認（自動で有効になります）
2. ✅ 環境変数が正しく設定されているか確認
3. ✅ OneSignalが動作するか確認
4. ✅ 管理者ログインが動作するか確認
5. ✅ Cronが動作するか確認（翌日まで待つか、手動で実行）

## 🆚 xサーバー vs Vercel 比較

| 項目 | xサーバー | Vercel |
|------|----------|--------|
| **設定の簡単さ** | ❌ 複雑（Node.js環境構築が必要） | ✅ ほぼゼロ設定 |
| **セキュリティ** | ⚠️ 自己管理が必要 | ✅ 自動HTTPS、DDoS保護 |
| **デプロイ速度** | ⚠️ 手動で時間がかかる | ✅ 数分で自動デプロイ |
| **スケーラビリティ** | ⚠️ 限定的 | ✅ 自動スケーリング |
| **CDN** | ❌ なし | ✅ グローバルCDN |
| **コスト** | 💰 月額料金 | ✅ 無料プランあり |
| **Cron機能** | ⚠️ 設定が必要 | ✅ 簡単に設定可能 |

## 🎯 結論

**Vercelの方が圧倒的に便利で、セキュリティーも高いです！**

特にNext.jsアプリの場合、Vercelは最適な選択です。無料プランでも十分に使えますし、セキュリティーも自動で管理されます。

