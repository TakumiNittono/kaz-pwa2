# PWA化の設定

## ✅ 実装済みの機能

1. **manifest.json** - PWAの基本設定
2. **Service Worker** - オフライン対応とキャッシュ
3. **メタタグ** - PWA用のメタ情報
4. **インストールボタン** - アプリインストール用のUI

## 📱 PWA機能

### インストール可能

- スマートフォンやデスクトップにアプリとしてインストール可能
- ホーム画面に追加可能
- スタンドアロンモードで動作

### オフライン対応

- Service Workerによるキャッシュ機能
- ネットワークがなくても基本機能が利用可能

### アプリのような体験

- フルスクリーン表示
- スプラッシュスクリーン
- ネイティブアプリのようなUI

## 🎨 アイコンの追加（オプション）

PWAを完全にするには、アイコン画像を追加してください：

1. `public/icon-192.png` (192x192px)
2. `public/icon-512.png` (512x512px)

これらのアイコンがない場合でも、PWAは動作しますが、アイコンが表示されません。

### アイコン作成方法

- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## 🔧 動作確認

### 開発環境

1. 開発サーバーを起動: `npm run dev`
2. ブラウザで http://localhost:3000 にアクセス
3. デベロッパーツール → Application → Manifest で確認

### 本番環境（Vercel）

1. Vercelにデプロイ（HTTPS必須）
2. スマートフォンでアクセス
3. ブラウザのメニューから「ホーム画面に追加」を選択

## 📋 確認項目

- [x] manifest.json が存在
- [x] Service Worker が登録
- [x] メタタグが設定済み
- [x] インストールボタンが表示
- [ ] アイコン画像（オプション）

## 🚀 次のステップ

1. アイコン画像を追加（推奨）
2. Vercelにデプロイ（HTTPS必須）
3. スマートフォンで動作確認

---

**注意**: PWAはHTTPS環境（またはlocalhost）でのみ動作します。Vercelにデプロイすると自動的にHTTPSが有効になります。

