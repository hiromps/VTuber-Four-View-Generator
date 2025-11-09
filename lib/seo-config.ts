export const defaultSEO = {
  defaultTitle: 'VTuber四面図AI | イラストから3Dモデル用四面図を自動生成',
  titleTemplate: '%s | VTuber四面図AI',
  description: 'VTuberのイラストをAIで3Dモデル・Live2D用四面図に変換。正面・背面・左右の4方向+表情差分を自動生成。3Dモデリングやモデル制作の資料作りに最適。無料トライアル付き。',
  canonical: 'https://smartgram.online',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://smartgram.online',
    siteName: 'VTuber四面図AI',
    title: 'VTuber四面図AI - イラストから3Dモデル用四面図を自動生成',
    description: 'VTuberのイラストを3D化・Live2D化する際の四面図資料をAIで自動生成。Blender、VRoid、Live2Dでのモデル制作をサポート。初回5トークン無料。',
    images: [
      {
        url: 'https://smartgram.online/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VTuber四面図AI - イラストから3Dモデル用四面図を自動生成',
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
      content: 'VTuber 3D化,イラスト 3Dモデル化,四面図 作成,Live2D 資料,3Dモデリング 参考資料,VRoid カスタマイズ,Blender VTuber,キャラクター 3D化,表情差分,AI イラスト生成,バーチャルYouTuber,ターンアラウンド,キャラクターシート',
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
  alternateName: 'VTuber 3Dモデル化ツール',
  url: 'https://smartgram.online',
  description: 'VTuberのイラストを3Dモデル・Live2D用四面図に自動変換するAIツール。Blender、VRoid、Live2Dでのモデル制作をサポート。',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
    availability: 'https://schema.org/InStock',
    priceValidUntil: '2025-12-31',
  },
  creator: {
    '@type': 'Organization',
    name: 'VTuber四面図AI',
    url: 'https://smartgram.online',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'イラストから四面図（正面・背面・左右）を自動生成',
    '表情差分（喜怒哀楽）の自動作成',
    '3Dモデリング用参考資料の出力',
    'Live2D制作用キャラクターシート作成',
    'PNG高解像度ダウンロード',
    'ZIP一括ダウンロード',
  ],
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
        text: 'VTuber四面図AIは、VTuberのイラストを3Dモデル・Live2D用の四面図（正面・背面・左右）に自動変換するAIツールです。Blender、VRoid、Live2Dでのモデル制作に必要な参考資料を数秒で作成できます。',
      },
    },
    {
      '@type': 'Question',
      name: '3Dモデル化やLive2D化に使えますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、生成された四面図は3Dモデリング（Blender、VRoid等）やLive2D制作の参考資料として使用できます。正面・背面・左右の4方向の画像により、キャラクターを立体的に把握できます。',
      },
    },
    {
      '@type': 'Question',
      name: '料金はいくらですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '初回登録で5トークン無料。四面図生成は4トークン、表情差分は4トークン、コンセプトアートは1トークン必要です。追加トークンは10個499円から購入可能。広告視聴で1日1トークン無料獲得も可能です。',
      },
    },
    {
      '@type': 'Question',
      name: '生成した画像の商用利用は可能ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、生成された画像は商用利用可能です。3Dモデル制作、Live2D制作、YouTube配信、グッズ制作など様々な用途でご利用いただけます。',
      },
    },
    {
      '@type': 'Question',
      name: 'どのような形式で画像をダウンロードできますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PNG形式で高解像度の画像をダウンロード可能です。四面図（正面・背面・左右）や表情差分はZIPファイルでまとめてダウンロードできます。',
      },
    },
    {
      '@type': 'Question',
      name: 'VRoidやBlenderで使用できますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、生成された四面図画像はVRoid StudioやBlenderでの3Dモデリング時の参考資料として使用できます。四面図により、キャラクターの前後左右を確認しながらモデリングできます。',
      },
    },
  ],
};

// HowTo構造化データ（使い方ガイド）
export const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'VTuberのイラストを3Dモデル用四面図に変換する方法',
  description: 'VTuberのイラストをAIで3Dモデル・Live2D用の四面図に変換する手順を解説します',
  image: 'https://smartgram.online/og-image.jpg',
  totalTime: 'PT5M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'JPY',
    value: '0',
  },
  tool: [
    {
      '@type': 'HowToTool',
      name: 'VTuberのイラスト（PNG/JPEG/WebP）',
    },
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'ログイン',
      text: 'VTuber四面図AIにログインします。初回登録で5トークン無料プレゼント。',
      url: 'https://smartgram.online',
      image: 'https://smartgram.online/guide-step1.jpg',
    },
    {
      '@type': 'HowToStep',
      name: 'イラストをアップロード',
      text: 'VTuberの正面向きイラスト（PNG、JPEG、WebP）をアップロードします。512x512ピクセル以上推奨。',
      url: 'https://smartgram.online',
      image: 'https://smartgram.online/guide-step2.jpg',
    },
    {
      '@type': 'HowToStep',
      name: '生成タイプを選択',
      text: '四面図生成（4トークン）、表情差分（4トークン）、コンセプトアート（1トークン）から選択します。',
      url: 'https://smartgram.online',
      image: 'https://smartgram.online/guide-step3.jpg',
    },
    {
      '@type': 'HowToStep',
      name: '生成開始',
      text: '生成ボタンをクリックすると、AIが自動で四面図（正面・背面・左右）を生成します。',
      url: 'https://smartgram.online',
      image: 'https://smartgram.online/guide-step4.jpg',
    },
    {
      '@type': 'HowToStep',
      name: 'ダウンロード',
      text: '生成された画像をPNG形式で個別ダウンロード、またはZIPで一括ダウンロードします。',
      url: 'https://smartgram.online',
      image: 'https://smartgram.online/guide-step5.jpg',
    },
    {
      '@type': 'HowToStep',
      name: '3Dモデリングに活用',
      text: 'ダウンロードした四面図をBlender、VRoid Studio、Live2Dなどで参考資料として使用します。',
      url: 'https://smartgram.online',
      image: 'https://smartgram.online/guide-step6.jpg',
    },
  ],
};

// BreadcrumbList構造化データ
export const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'ホーム',
      item: 'https://smartgram.online',
    },
  ],
};

// FAQ用BreadcrumbList
export const faqBreadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'ホーム',
      item: 'https://smartgram.online',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'よくある質問',
      item: 'https://smartgram.online/faq',
    },
  ],
};