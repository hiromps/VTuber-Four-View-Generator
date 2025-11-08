import { Metadata } from 'next'
import { faqSchema } from '@/lib/seo-config'

export const metadata: Metadata = {
  title: 'よくある質問 - VTuberイラストの3Dモデル化について',
  description: 'VTuberのイラストを3Dモデル・Live2D化する際の四面図生成に関するFAQ。Blender、VRoid Studio、Live2Dでの活用方法、料金、商用利用などについて詳しく説明します。',
  openGraph: {
    title: 'よくある質問 | VTuber四面図AI - イラストの3Dモデル化',
    description: 'VTuberイラストから3Dモデル・Live2D用の四面図を生成する方法、使い方、料金について詳しく解説',
  },
}

const faqs = [
  {
    question: 'VTuber四面図AIとは何ですか？',
    answer: 'VTuber四面図AIは、VTuberのイラストを3DモデルやLive2D化するために必要な四面図（正面・背面・左右の4方向）を自動生成するAIツールです。1枚のイラストをアップロードするだけで、3Dモデリングに必要な参考資料を数秒で作成できます。',
  },
  {
    question: 'VTuberのイラストを3Dモデルにするにはどうすればいいですか？',
    answer: 'VTuberのイラストを3Dモデルにするには、まず四面図（正面・背面・左右）の参考資料が必要です。VTuber四面図AIでイラストから四面図を自動生成し、その資料をBlender、Maya、VRoid Studioなどの3Dモデリングソフトで参考にしながらモデリングします。Live2Dの場合も同様に四面図を参考資料として使用できます。',
  },
  {
    question: 'どんな3Dモデリングソフトに対応していますか？',
    answer: '生成された四面図はPNG形式のため、Blender、Maya、3ds Max、ZBrush、VRoid Studio、メタセコイアなど、あらゆる3Dモデリングソフトで参考資料として使用可能です。画像ビューアーで表示しながらモデリングできます。',
  },
  {
    question: 'Live2D制作にも使えますか？',
    answer: 'はい、Live2D制作にも活用できます。生成された四面図を参考に、キャラクターの側面や背面のデザインを把握できるため、Live2Dモデルのパーツ分け作業がスムーズになります。表情差分機能も合わせて使うことで、より豊かな表現が可能です。',
  },
  {
    question: '料金はいくらですか？',
    answer: '初回登録で5トークン無料でお試しいただけます。四面図生成（正面・背面・左右の4枚）は4トークン、表情差分生成は4トークン、コンセプトアートは1トークン必要です。追加トークンは10個499円から購入可能。毎日広告を見ることで1トークン無料獲得も可能です。',
  },
  {
    question: '生成した画像の商用利用は可能ですか？',
    answer: 'はい、生成された四面図や表情差分は商用利用可能です。VTuberの3Dモデル制作、Live2D制作、YouTube配信、グッズ制作など、様々な用途でご自由にお使いいただけます。ただし、利用規約に従ってご使用ください。',
  },
  {
    question: 'どのような形式で画像をダウンロードできますか？',
    answer: 'PNG形式で高解像度（1024x1024px）の画像をダウンロード可能です。四面図の4枚すべてをZIPファイルでまとめてダウンロードでき、3Dモデリングソフトで参照しやすいように整理されています。',
  },
  {
    question: 'どのような画像をアップロードすればよいですか？',
    answer: '正面向きのVTuberキャラクター画像（イラスト）をアップロードしてください。対応フォーマットはPNG、JPEG、WebPです。解像度は512x512ピクセル以上を推奨します。背景が透明または単色のイラストが最適です。',
  },
  {
    question: '四面図から3Dモデリングする際のコツはありますか？',
    answer: '生成された四面図を参考画像として3Dモデリングソフトに読み込み、正面・側面・背面のビューで確認しながらモデリングすることをおすすめします。Blenderでは背景画像機能、VRoid Studioではテンプレート機能を活用できます。',
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
    question: '表情差分はどのような種類がありますか？',
    answer: '喜び、怒り、悲しみ、驚きの4種類の基本表情を生成します。各表情は元のキャラクターの特徴を保ちながら、自然な表情変化を実現します。3Dモデルやlive2Dのフェイシャルアニメーション制作の参考資料として活用できます。',
  },
]

export default function FAQPage() {
  return (
    <>
      {/* 構造化データ */}
      <script
        key="schema-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
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