/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Vercel向けの最適化
  // 画像最適化はVercelで自動的に有効
  images: {
    // 外部ドメインの画像を使用する場合はここに追加
    remotePatterns: [],
  },

  // パフォーマンス最適化
  poweredByHeader: false, // X-Powered-Byヘッダーを削除（セキュリティ）
  
  // 本番環境でのログ出力を削減
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
}

module.exports = nextConfig

