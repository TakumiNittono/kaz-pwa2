# OneSignalドメインエラー修正ガイド

## 🔴 エラーメッセージ

```
Error: Can only be used on: https://kazzz.online. 
Your current origin is https://kaz-pwa2.vercel.app.
```

## ✅ 解決方法

このエラーは、OneSignalダッシュボードでSite URLがまだ古いドメイン（`https://kazzz.online`）に設定されているために発生しています。

### ステップ1: OneSignalダッシュボードでSite URLを更新

1. [OneSignal Dashboard](https://dashboard.onesignal.com) にログイン
2. アプリを選択（App ID: `7477e3e2-7f08-40cc-953a-6c418866f1ac`）
3. **Settings** → **Platforms** → **Web Push** を開く
4. **Web Configuration** セクションを確認
5. **Section 2: Site URL** を確認・更新:
   - **現在の設定**: `https://kazzz.online`（古いドメイン）
   - **変更後**: `https://kaz-pwa2.vercel.app`
   - ⚠️ **重要**: 末尾のスラッシュ（`/`）は付けない
6. **保存** ボタンをクリック

### ステップ2: 複数のドメインを使用する場合（オプション）

もし `https://kazzz.online` と `https://kaz-pwa2.vercel.app` の両方で動作させたい場合：

1. OneSignalダッシュボードで **Settings** → **Platforms** → **Web Push** を開く
2. **「+ Add Site」** ボタンをクリック（または既存のサイト設定を編集）
3. 新しいサイト設定を作成：
   - **SITE NAME**: `kaz-pwa2.vercel.app`
   - **SITE URL**: `https://kaz-pwa2.vercel.app`
4. **保存**

### ステップ3: ブラウザのキャッシュをクリア

OneSignalの設定変更後：

1. ブラウザの開発者ツールを開く（F12）
2. **Application** タブを開く
3. **Service Workers** を選択
4. **Unregister** をクリック（すべてのService Workerを削除）
5. **Storage** → **Clear site data** をクリック
6. ページを再読み込み（Ctrl+Shift+R / Cmd+Shift+R）

### ステップ4: 動作確認

1. ブラウザのコンソールを開く（F12）
2. エラーが消えているか確認
3. 通知機能が正常に動作するか確認

## ⚠️ 重要な注意点

1. **OneSignalの設定変更は反映に数分かかる場合があります**（最大5-10分）
2. **Service Workerのキャッシュをクリア**する必要があります
3. **ブラウザのキャッシュもクリア**してください
4. 設定変更後、**ページを完全に再読み込み**してください

## 🔍 トラブルシューティング

### エラーが続く場合

1. **OneSignalダッシュボードで設定を再確認**
   - Site URLが正しく `https://kaz-pwa2.vercel.app` に設定されているか
   - 保存ボタンをクリックしたか

2. **ブラウザのキャッシュを完全にクリア**
   - 開発者ツール → Application → Clear storage
   - Service Workersをすべて削除

3. **シークレットモードでテスト**
   - 新しいシークレットウィンドウで `https://kaz-pwa2.vercel.app` にアクセス
   - エラーが消えているか確認

4. **数分待ってから再試行**
   - OneSignalの設定変更は反映に時間がかかる場合があります


