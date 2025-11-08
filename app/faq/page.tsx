import { Metadata } from 'next'
import { faqSchema, faqBreadcrumbSchema } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: 'よくある質問',
  description: 'VTuber四面図AIに関するよくある質問と回答をまとめています。料金、使い方、商用利用などについて詳しく説明します。',
  openGraph: {
    title: 'よくある質問 | VTuber四面図AI',
    description: 'VTuber四面図AIの使い方、料金、商用利用について詳しく解説',
  },
}

const faqs = [
  {
    question: 'VTuber四面図AIとは何ですか？',
    answer: 'VTuber四面図AIは、VTuberのイラストを3Dモデル・Live2D用の四面図（正面・背面・左右）に自動変換するAIツールです。Blender、VRoid Studio、Live2Dでのモデル制作に必要な参考資料を数秒で作成できます。プロ品質のキャラクターデザインをサポートします。',
  },
  {
    question: '3Dモデル化やLive2D化に使えますか？',
    answer: 'はい、生成された四面図は3Dモデリング（Blender、VRoid等）やLive2D制作の参考資料として使用できます。正面・背面・左右の4方向の画像により、キャラクターを立体的に把握でき、モデリング作業がスムーズになります。',
  },
  {
    question: '料金はいくらですか？',
    answer: '初回登録で5トークン無料でお試しいただけます。四面図生成は4トークン、表情差分生成は4トークン、コンセプトアートは1トークン必要です。追加トークンは10個499円から購入可能。広告視聴で1日1トークン無料獲得も可能です。',
  },
  {
    question: '生成した画像の商用利用は可能ですか？',
    answer: 'はい、生成された画像は商用利用可能です。3Dモデル制作、Live2D制作、YouTube配信、グッズ制作、ゲーム開発など、様々な用途でご利用いただけます。ただし、利用規約に従ってご使用ください。',
  },
  {
    question: 'どのような形式で画像をダウンロードできますか？',
    answer: 'PNG形式で高解像度の画像をダウンロード可能です。複数画像はZIPファイルでまとめてダウンロードでき、X（旧Twitter）でのシェア用に最適化された画像も生成できます。',
  },
  {
    question: 'どのような画像をアップロードすればよいですか？',
    answer: '正面向きのキャラクター画像（イラストまたは写真）をアップロードしてください。対応フォーマットはPNG、JPEG、WebPです。解像度は512x512ピクセル以上を推奨します。',
  },
  {
    question: 'トークンに有効期限はありますか？',
    answer: '購入したトークンに有効期限はありません。ただし、サブスクリプションプランの場合、毎月付与されるトークンは翌月に繰り越されません。',
  },
  {
    question: '生成に失敗した場合、トークンは返金されますか？',
    answer: 'システムエラーによる生成失敗の場合は、自動的にトークンが返金されます。ただし、不適切な画像のアップロードなど、ユーザー側の原因による失敗の場合は返金されません。',
  },
  {
    question: 'VRoidやBlenderで使用できますか？',
    answer: 'はい、生成された四面図画像はVRoid StudioやBlenderでの3Dモデリング時の参考資料として使用できます。四面図により、キャラクターの前後左右を確認しながらモデリングでき、作業効率が大幅に向上します。',
  },
  {
    question: 'Live2Dモデル作成に活用できますか？',
    answer: 'はい、四面図と表情差分はLive2D Cubismでのモデル作成時の参考資料として最適です。特に表情差分機能を使うことで、様々な表情パターンをLive2Dに取り込むことができます。',
  },
  {
    question: '表情差分はどのような種類がありますか？',
    answer: '喜び、怒り、悲しみ、驚きの4種類の基本表情を生成します。各表情は元のキャラクターの特徴を保ちながら、自然な表情変化を実現します。',
  },
  {
    question: 'サポートはありますか？',
    answer: 'メールサポートを提供しています。プレミアムプラン以上のユーザーには優先サポートを提供し、より迅速な対応を行っています。',
  },
]

export default function FAQPage() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqBreadcrumbSchema),
        }}
      />

      <div className="min-h-screen bg-gray-900 text-white">
        {/* ヘッダー */}
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4">
          <div className="container mx-auto">
            <nav className="flex items-center justify-between">
              <a href="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                VTuber四面図AI
              </a>
              <a href="/" className="text-gray-300 hover:text-white transition">
                ← ホームに戻る
              </a>
            </nav>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="container mx-auto px-4 py-12">
          {/* ページタイトル */}
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl font-bold mb-4 text-center">
              よくある質問
            </h1>
            <p className="text-gray-400 text-center">
              VTuber四面図AIについて、よくお寄せいただく質問にお答えします
            </p>
          </div>

          {/* FAQ一覧 */}
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
              >
                <h2 className="text-xl font-semibold mb-3 text-purple-400">
                  Q. {faq.question}
                </h2>
                <div className="text-gray-300 leading-relaxed">
                  A. {faq.answer}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                さらに質問がありますか？
              </h2>
              <p className="text-gray-300 mb-6">
                お気軽にサポートまでお問い合わせください
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="mailto:support@vtuber-ai-generator.com"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  お問い合わせ
                </a>
                <a
                  href="/"
                  className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  無料で試す
                </a>
              </div>
            </div>
          </div>

          {/* 関連リンク */}
          <div className="max-w-4xl mx-auto mt-12">
            <h3 className="text-xl font-semibold mb-4">関連ページ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/terms"
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-750 transition"
              >
                <h4 className="font-semibold text-purple-400 mb-2">利用規約</h4>
                <p className="text-sm text-gray-400">サービス利用に関する規約</p>
              </a>
              <a
                href="/privacy"
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-750 transition"
              >
                <h4 className="font-semibold text-purple-400 mb-2">プライバシーポリシー</h4>
                <p className="text-sm text-gray-400">個人情報の取り扱い</p>
              </a>
              <a
                href="/guide"
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-750 transition"
              >
                <h4 className="font-semibold text-purple-400 mb-2">使い方ガイド</h4>
                <p className="text-sm text-gray-400">詳しい使用方法</p>
              </a>
            </div>
          </div>
        </main>

        {/* フッター */}
        <footer className="bg-gray-800 border-t border-gray-700 mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-gray-400">
              <p>© 2024 VTuber四面図AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}