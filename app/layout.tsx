import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import Providers from '@/components/Providers'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { GoogleAdSenseScript } from '@/components/GoogleAdSense'
import { defaultSEO, organizationSchema, howToSchema, breadcrumbSchema } from '@/lib/seo-config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://smartgram.online'),
  title: {
    default: defaultSEO.defaultTitle,
    template: defaultSEO.titleTemplate,
  },
  description: defaultSEO.description,
  keywords: ['VTuber', '四面図', 'AI', 'イラスト生成', 'キャラクターデザイン', '表情差分', 'コンセプトアート', 'Live2D', '3Dモデル'],
  authors: [{ name: 'VTuber四面図AI Team' }],
  creator: 'VTuber四面図AI',
  publisher: 'VTuber四面図AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: defaultSEO.canonical,
    siteName: defaultSEO.openGraph.siteName,
    title: defaultSEO.openGraph.title,
    description: defaultSEO.openGraph.description,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VTuber四面図AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultSEO.openGraph.title,
    description: defaultSEO.openGraph.description,
    creator: '@vtuber_ai',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: defaultSEO.canonical,
    languages: {
      'ja': '/ja',
      'en': '/en',
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_SITE_VERIFICATION,
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* 構造化データ（Schema.org） */}
        <script
          key="schema-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          key="schema-howto"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToSchema),
          }}
        />
        <script
          key="schema-breadcrumb"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        {/* PWA関連 */}
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VTuber四面図AI" />
      </head>
      <body className={inter.className}>
        {/* Google AdSense */}
        <GoogleAdSenseScript />
        <GoogleAnalytics />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}