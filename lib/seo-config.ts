export const defaultSEO = {
  defaultTitle: 'VTuber四面図AI | イラストから3Dモデル用の四面図を自動生成',
  titleTemplate: '%s | VTuber四面図AI',
  description: 'VTuberのイラストを3Dモデル・Live2D化するための四面図をAIが自動生成。1枚のイラストから正面・背面・左右の4方向を作成。3Dモデリング、Live2D制作の準備をスピーディーに。無料トライアル付き。',
  canonical: 'https://vtuber-ai-generator.com',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://vtuber-ai-generator.com',
    siteName: 'VTuber四面図AI',
    title: 'VTuber四面図AI - イラストから3Dモデル用の四面図を自動生成',
    description: '1枚のVTuberイラストから3D・Live2D制作に必要な四面図を自動生成。プロ品質の正面・背面・左右4方向の資料を数秒で作成。',
    images: [
      {
        url: 'https://vtuber-ai-generator.com/og-image.jpg',
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
      content: 'VTuber,3Dモデル,Live2D,四面図,イラスト 3D 変換,キャラクターモデリング,3D化,ターンアラウンド,character sheet,AI,イラスト生成,表情差分,モデリング資料,3Dアバター,バーチャルYouTuber,キャラクターデザイン',
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
  '@type': 'SoftwareApplication',
  name: 'VTuber四面図AI',
  url: 'https://vtuber-ai-generator.com',
  description: 'VTuberのイラストを3Dモデル・Live2D化するための四面図を自動生成するAIツール。1枚のイラストから正面・背面・左右の4方向資料を作成し、3Dモデリング作業を効率化します。',
  applicationCategory: 'DesignApplication',
  applicationSubCategory: '3D Modeling Tool',
  operatingSystem: 'Web Browser',
  browserRequirements: 'Requires JavaScript. Chrome, Firefox, Safari, Edge対応',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
    availability: 'https://schema.org/InStock',
    description: '初回5トークン無料。追加トークンは499円から購入可能',
  },
  featureList: [
    '1枚のイラストから四面図（正面・背面・左右）を自動生成',
    '3DモデルやLive2D制作に最適な資料作成',
    '表情差分の自動生成',
    'コンセプトアート作成',
    '高解像度PNG出力',
    'ZIP一括ダウンロード',
  ],
  creator: {
    '@type': 'Organization',
    name: 'VTuber四面図AI Team',
    url: 'https://vtuber-ai-generator.com',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
  screenshot: 'https://vtuber-ai-generator.com/og-image.jpg',
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
        text: 'VTuber四面図AIは、VTuberのイラストを3DモデルやLive2D化するために必要な四面図（正面・背面・左右の4方向）を自動生成するAIツールです。1枚のイラストをアップロードするだけで、3Dモデリングに必要な参考資料を数秒で作成できます。',
      },
    },
    {
      '@type': 'Question',
      name: 'VTuberのイラストを3Dモデルにするにはどうすればいいですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'VTuberのイラストを3Dモデルにするには、まず四面図（正面・背面・左右）の参考資料が必要です。VTuber四面図AIでイラストから四面図を自動生成し、その資料をBlender、Maya、VRoid Studioなどの3Dモデリングソフトで参考にしながらモデリングします。Live2Dの場合も同様に四面図を参考資料として使用できます。',
      },
    },
    {
      '@type': 'Question',
      name: '料金はいくらですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '初回登録で5トークン無料。四面図生成（正面・背面・左右の4枚）は4トークン、コンセプトアートは1トークン必要です。追加トークンは10個499円から購入可能。毎日広告を見ることで1トークン無料獲得も可能です。',
      },
    },
    {
      '@type': 'Question',
      name: '生成した画像の商用利用は可能ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、生成された四面図や表情差分は商用利用可能です。VTuberの3Dモデル制作、Live2D制作、キャラクターグッズ制作などにご自由にお使いいただけます。ただし、利用規約に従ってご使用ください。',
      },
    },
    {
      '@type': 'Question',
      name: 'どのような形式で画像をダウンロードできますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PNG形式で高解像度（1024x1024px）の画像をダウンロード可能です。四面図の4枚すべてをZIPファイルでまとめてダウンロードでき、3Dモデリングソフトで参照しやすいように整理されています。',
      },
    },
    {
      '@type': 'Question',
      name: 'Live2D制作にも使えますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、Live2D制作にも活用できます。生成された四面図を参考に、キャラクターの側面や背面のデザインを把握できるため、Live2Dモデルのパーツ分け作業がスムーズになります。',
      },
    },
    {
      '@type': 'Question',
      name: 'どんな3Dモデリングソフトに対応していますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '生成された四面図はPNG形式のため、Blender、Maya、3ds Max、ZBrush、VRoid Studio、メタセコイアなど、あらゆる3Dモデリングソフトで参考資料として使用可能です。画像ビューアーで表示しながらモデリングできます。',
      },
    },
  ],
};

// HowToスキーマ（VTuberイラストの3D化手順）
export const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'VTuberのイラストを3Dモデルにする方法',
  description: 'VTuber四面図AIを使ってイラストから3Dモデル制作用の四面図を生成し、3Dモデリングソフトで3D化する手順',
  image: 'https://vtuber-ai-generator.com/og-image.jpg',
  totalTime: 'PT30M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'JPY',
    value: '0',
  },
  tool: [
    {
      '@type': 'HowToTool',
      name: 'VTuber四面図AI',
    },
    {
      '@type': 'HowToTool',
      name: '3DモデリングソフトBlender、VRoid Studio、Maya等',
    },
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'VTuberのイラストを用意する',
      text: '3D化したいVTuberキャラクターの正面イラストを用意します。',
      url: 'https://vtuber-ai-generator.com',
      image: 'https://vtuber-ai-generator.com/og-image.jpg',
    },
    {
      '@type': 'HowToStep',
      name: 'VTuber四面図AIで四面図を生成',
      text: 'VTuber四面図AIにイラストをアップロードし、正面・背面・左右の4方向の四面図を自動生成します。',
      url: 'https://vtuber-ai-generator.com',
      image: 'https://vtuber-ai-generator.com/og-image.jpg',
    },
    {
      '@type': 'HowToStep',
      name: '四面図をダウンロード',
      text: '生成された四面図4枚をZIPファイルでダウンロードします。',
      url: 'https://vtuber-ai-generator.com',
    },
    {
      '@type': 'HowToStep',
      name: '3Dモデリングソフトで参照',
      text: 'Blender、VRoid Studio、Mayaなどの3Dモデリングソフトで四面図を参照しながらモデリングします。',
    },
    {
      '@type': 'HowToStep',
      name: '3Dモデルの完成',
      text: '四面図を参考にモデリングを進め、VTuberの3Dモデルを完成させます。',
    },
  ],
};