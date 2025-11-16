import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '運営者情報',
  description: 'VTuber四面図AIの運営者情報とサービス概要を掲載しています。',
  openGraph: {
    title: '運営者情報 | VTuber四面図AI',
    description: 'サービス運営者情報',
  },
}

export default function AboutPage() {
  return (
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
        <div className="max-w-4xl mx-auto">
          {/* ページタイトル */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">運営者情報</h1>
            <p className="text-gray-400">VTuber四面図AIについて</p>
          </div>

          {/* コンテンツ */}
          <div className="space-y-8">
            {/* サービス概要 */}
            <section className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-purple-400 mb-6">サービス概要</h2>
              <div className="space-y-4 text-gray-300">
                <div className="flex border-b border-gray-700 pb-4">
                  <div className="w-1/3 font-semibold">サービス名</div>
                  <div className="w-2/3">VTuber四面図AI</div>
                </div>
                <div className="flex border-b border-gray-700 pb-4">
                  <div className="w-1/3 font-semibold">サイトURL</div>
                  <div className="w-2/3">
                    <a href="https://smartgram.online" className="text-purple-400 hover:underline">
                      https://smartgram.online
                    </a>
                  </div>
                </div>
                <div className="flex border-b border-gray-700 pb-4">
                  <div className="w-1/3 font-semibold">サービス内容</div>
                  <div className="w-2/3">
                    AIを活用したVTuberキャラクターの四面図・表情差分・コンセプトアート自動生成サービス
                  </div>
                </div>
                <div className="flex border-b border-gray-700 pb-4">
                  <div className="w-1/3 font-semibold">開設日</div>
                  <div className="w-2/3">2024年12月</div>
                </div>
              </div>
            </section>

            {/* 運営者情報 */}
            <section className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-purple-400 mb-6">運営者情報</h2>
              <div className="space-y-4 text-gray-300">
                <div className="flex border-b border-gray-700 pb-4">
                  <div className="w-1/3 font-semibold">運営</div>
                  <div className="w-2/3">VTuber四面図AI運営チーム</div>
                </div>
                <div className="flex border-b border-gray-700 pb-4">
                  <div className="w-1/3 font-semibold">お問い合わせ</div>
                  <div className="w-2/3">
                    <a href="/contact" className="text-purple-400 hover:underline">
                      お問い合わせフォーム
                    </a>
                    <br />
                    <a href="mailto:support@vtuber-ai-generator.com" className="text-purple-400 hover:underline break-all">
                      support@vtuber-ai-generator.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* サービスの特徴 */}
            <section className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-purple-400 mb-6">サービスの特徴</h2>
              <div className="space-y-6 text-gray-300">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">1. AI画像生成技術</h3>
                  <p className="leading-relaxed">
                    最新のGoogle Gemini APIを活用し、高品質な四面図やキャラクターアートを自動生成します。
                    VTuberやゲームキャラクターのデザインに必要な複数角度の画像を、わずか数分で作成可能です。
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">2. 3D/Live2D制作支援</h3>
                  <p className="leading-relaxed">
                    生成された四面図は、Blender、VRoid Studio、Live2D Cubismなどの3Dモデリング・Live2D制作ツールの参考資料として活用できます。
                    キャラクターの立体的な把握が容易になり、制作効率が大幅に向上します。
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">3. 多彩な生成機能</h3>
                  <p className="leading-relaxed">
                    四面図生成に加え、表情差分（喜怒哀楽）、コンセプトアート、ポーズ生成など、
                    キャラクターデザインに必要な様々な画像を生成できます。
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">4. 使いやすい料金体系</h3>
                  <p className="leading-relaxed">
                    トークン制を採用し、必要な分だけ購入できる柔軟な料金体系です。
                    初回登録で無料トークンをプレゼント、広告視聴でも無料トークンを獲得できます。
                  </p>
                </div>
              </div>
            </section>

            {/* 技術スタック */}
            <section className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-purple-400 mb-6">使用技術</h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">フロントエンド</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Next.js 14</li>
                    <li>React</li>
                    <li>TypeScript</li>
                    <li>Tailwind CSS</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">バックエンド</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Supabase (データベース・認証)</li>
                    <li>Google Gemini API (AI生成)</li>
                    <li>Stripe (決済)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ビジョン */}
            <section className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-4">私たちのビジョン</h2>
              <p className="text-gray-300 leading-relaxed">
                VTuber四面図AIは、クリエイターの創造性を最大限に引き出すことを目指しています。
                AI技術を活用することで、時間のかかる作業を自動化し、クリエイターがより創造的な部分に集中できる環境を提供します。
                VTuber、ゲーム開発、アニメーション制作など、あらゆるキャラクター制作の現場で、
                クリエイターの強力なパートナーとなることを目標としています。
              </p>
            </section>

            {/* リンク集 */}
            <section className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-purple-400 mb-6">関連リンク</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="/privacy"
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition"
                >
                  <h3 className="font-semibold text-white mb-2">プライバシーポリシー</h3>
                  <p className="text-sm text-gray-400">個人情報の取り扱いについて</p>
                </a>
                <a
                  href="/terms"
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition"
                >
                  <h3 className="font-semibold text-white mb-2">利用規約</h3>
                  <p className="text-sm text-gray-400">サービス利用条件</p>
                </a>
                <a
                  href="/faq"
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition"
                >
                  <h3 className="font-semibold text-white mb-2">よくある質問</h3>
                  <p className="text-sm text-gray-400">FAQ</p>
                </a>
                <a
                  href="/contact"
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition"
                >
                  <h3 className="font-semibold text-white mb-2">お問い合わせ</h3>
                  <p className="text-sm text-gray-400">サポート窓口</p>
                </a>
              </div>
            </section>
          </div>

          {/* フッターリンク */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <a href="/" className="text-purple-400 hover:underline">ホーム</a>
              <a href="/app" className="text-purple-400 hover:underline">アプリを開く</a>
              <a href="/faq" className="text-purple-400 hover:underline">FAQ</a>
            </div>
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
  )
}
