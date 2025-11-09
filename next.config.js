/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // セキュリティヘッダーの設定
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // XSS対策
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // クリックジャッキング対策
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // XSS フィルター
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // リファラーポリシー
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      {
        // API エンドポイント用の追加セキュリティヘッダー
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
