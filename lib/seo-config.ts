export const defaultSEO = {
  defaultTitle: 'VTuber四面図AI | AIで簡単にVTuberキャラクターを生成',
  titleTemplate: '%s | VTuber四面図AI',
  description: 'AIを使ってVTuberの四面図、表情差分、コンセプトアートを簡単に生成。プロ品質のキャラクターデザインを数秒で作成。無料トライアル付き。',
  canonical: 'https://vtuber-ai-generator.com',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://vtuber-ai-generator.com',
    siteName: 'VTuber四面図AI',
    title: 'VTuber四面図AI - AIでVTuberキャラクターを簡単生成',
    description: 'AIを使ってプロ品質のVTuber四面図、表情差分、コンセプトアートを生成。初回5トークン無料。',
    images: [
      {
        url: 'https://vtuber-ai-generator.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VTuber四面図AI',
      },
    ],
  },
  twitter: {
    handle: '@vtuber_ai',
    site: '@vtuber_ai',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'VTuber,四面図,AI,イラスト生成,キャラクターデザイン,表情差分,コンセプトアート,Live2D,3Dモデル,バーチャルYouTuber',
    },
    {
      name: 'author',
      content: 'VTuber四面図AI Team',
    },
    {
      property: 'dc:creator',
      content: 'VTuber四面図AI',
    },
    {
      name: 'application-name',
      content: 'VTuber四面図AI',
    },
    {
      httpEquiv: 'x-ua-compatible',
      content: 'IE=edge',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
  ],
};

// 構造化データ（Schema.org）
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'VTuber四面図AI',
  url: 'https://vtuber-ai-generator.com',
  description: 'AIを使用したVTuberキャラクター生成ツール',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
  creator: {
    '@type': 'Organization',
    name: 'VTuber四面図AI',
    url: 'https://vtuber-ai-generator.com',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1250',
  },
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'VTuber四面図AIとは何ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'VTuber四面図AIは、AIを使用してVTuberキャラクターの四面図（正面・背面・左右）、表情差分、コンセプトアートを自動生成するWebアプリケーションです。',
      },
    },
    {
      '@type': 'Question',
      name: '料金はいくらですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '初回登録で5トークン無料。四面図生成は4トークン、コンセプトアートは1トークン必要です。追加トークンは10個499円から購入可能です。',
      },
    },
    {
      '@type': 'Question',
      name: '生成した画像の商用利用は可能ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、生成された画像は商用利用可能です。ただし、利用規約に従ってご使用ください。',
      },
    },
    {
      '@type': 'Question',
      name: 'どのような形式で画像をダウンロードできますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PNG形式で高解像度の画像をダウンロード可能です。複数画像はZIPファイルでまとめてダウンロードできます。',
      },
    },
  ],
};