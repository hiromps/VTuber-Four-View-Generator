import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約',
  description: 'VTuber四面図AIの利用規約。サービス利用に関する条件と注意事項を説明します。',
  openGraph: {
    title: '利用規約 | VTuber四面図AI',
    description: 'サービス利用に関する規約',
  },
}

export default function TermsPage() {
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
            <h1 className="text-4xl font-bold mb-4">利用規約</h1>
            <p className="text-gray-400">最終更新日: 2024年12月17日</p>
          </div>

          {/* コンテンツ */}
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">第1条（適用）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>本規約は、VTuber四面図AI（以下「当サービス」）の利用に関する条件を定めるものです。</li>
                <li>ユーザーは、当サービスを利用することにより、本規約に同意したものとみなされます。</li>
                <li>当サービスは、必要に応じて本規約を変更することができます。変更後の規約は、当サービス上に掲示した時点から効力を生じます。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">第2条（定義）</h2>
              <p className="mb-4">本規約において使用する用語の定義は、以下のとおりとします。</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>「ユーザー」</strong>: 当サービスを利用する個人または法人</li>
                <li><strong>「アカウント」</strong>: ユーザーが当サービスを利用するために登録した個人情報</li>
                <li><strong>「トークン」</strong>: 当サービスで画像生成機能を利用するための利用権</li>
                <li><strong>「生成コンテンツ」</strong>: 当サービスのAI機能により生成された画像</li>
                <li><strong>「投稿コンテンツ」</strong>: ユーザーが当サービスにアップロードした画像やデータ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">第3条（アカウント登録）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>ユーザーは、正確かつ最新の情報を提供してアカウント登録を行うものとします。</li>
                <li>ユーザーは、自己の責任においてアカウント情報を管理するものとします。</li>
                <li>ユーザーは、第三者にアカウントを利用させてはならないものとします。</li>
                <li>アカウントの不正使用により生じた損害について、当サービスは一切の責任を負いません。</li>
                <li>13歳未満の方は、当サービスを利用できません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">第4条（トークンと課金）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>当サービスの一部機能は、トークンを消費して利用します。</li>
                <li>トークンの料金は、当サービス上に表示されます。</li>
                <li>購入したトークンの返金は、原則として行いません。</li>
                <li>システムエラーにより生成が失敗した場合は、消費されたトークンを返却します。</li>
                <li>トークンの有効期限は、購入時点から無期限とします。ただし、サブスクリプションプランの付与トークンは翌月繰越不可とします。</li>
                <li>決済はStripeを通じて安全に処理されます。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">第5条（禁止事項）</h2>
              <p className="mb-4">ユーザーは、以下の行為を行ってはなりません。</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>他者の知的財産権、肖像権、プライバシー、名誉その他の権利を侵害する行為</li>
                <li>他者になりすます行為</li>
                <li>わいせつ、児童ポルノ、児童虐待に関連する画像のアップロード</li>
                <li>暴力的、差別的、または攻撃的な内容の画像のアップロード</li>
                <li>当サービスのサーバーやネットワークに過度な負荷をかける行為</li>
                <li>当サービスの運営を妨害する行為</li>
                <li>不正アクセス、リバースエンジニアリング等の行為</li>
                <li>複数アカウントの作成による不正なトークン取得</li>
                <li>商用目的での自動化ツールやボットの使用</li>
                <li>生成された画像を、元の著作権者の権利を侵害する形で使用する行為</li>
                <li>その他、当サービスが不適切と判断する行為</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">第6条（投稿コンテンツの取り扱い）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>ユーザーは、投稿コンテンツについて、適法な権利を有していることを保証するものとします。</li>
                <li>ユーザーは、投稿コンテンツについて、当サービスがAI処理のために利用することを許諾するものとします。</li>
                <li>投稿コンテンツは、処理完了後一定期間経過後に自動削除されます。</li>
                <li>当サービスは、投稿コンテンツの内容について一切の責任を負いません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">第7条（生成コンテンツの権利）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>生成コンテンツの著作権は、ユーザーに帰属します。</li>
                <li>ユーザーは、生成コンテンツを商用・非商用を問わず自由に利用できます。</li>
                <li>ただし、生成コンテンツの利用により第三者との間で紛争が生じた場合、ユーザーが自己の責任と費用で解決するものとし、当サービスは一切の責任を負いません。</li>
                <li>ユーザーは、当サービスが宣伝・プロモーション目的で生成コンテンツを使用することを許諾するものとします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">第8条（免責事項）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>当サービスは、サービスの正確性、完全性、有用性を保証しません。</li>
                <li>当サービスは、予告なくサービスの内容を変更、または提供を中止することがあります。</li>
                <li>当サービスは、システム障害、メンテナンス等により、サービスが一時的に利用できない場合があります。</li>
                <li>当サービスは、ユーザーの利用により生じた損害について、一切の責任を負いません。ただし、当サービスの故意または重過失による場合を除きます。</li>
                <li>AI生成の特性上、意図しない結果が生じる可能性があり、当サービスは生成結果について保証しません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">第9条（サービスの停止・中断）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>当サービスは、以下の場合、ユーザーへの事前通知なくサービスを停止・中断することがあります。
                  <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                    <li>システムの保守・点検を行う場合</li>
                    <li>天災地変等の不可抗力によりサービス提供が困難な場合</li>
                    <li>その他、運営上必要と判断した場合</li>
                  </ul>
                </li>
                <li>サービスの停止・中断により生じた損害について、当サービスは一切の責任を負いません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">第10条（利用制限・アカウント停止）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>当サービスは、ユーザーが以下に該当すると判断した場合、事前通知なくサービスの利用を制限、またはアカウントを停止することができます。
                  <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                    <li>本規約に違反した場合</li>
                    <li>登録情報に虚偽があった場合</li>
                    <li>不正な手段でトークンを取得した場合</li>
                    <li>その他、当サービスが不適切と判断した場合</li>
                  </ul>
                </li>
                <li>アカウント停止時、未使用のトークンは失効し、返金されません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">第11条（退会）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>ユーザーは、いつでもアカウントを削除し、当サービスから退会できます。</li>
                <li>退会後、アカウント情報および生成履歴は削除されます。</li>
                <li>退会時、未使用のトークンは失効し、返金されません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">第12条（準拠法・管轄裁判所）</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>本規約は、日本法に準拠し、日本法に従って解釈されます。</li>
                <li>当サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">第13条（お問い合わせ）</h2>
              <p className="mb-4">
                本規約に関するご質問は、お問い合わせページよりご連絡ください。
              </p>
              <div className="bg-gray-800 rounded-lg p-6">
                <a
                  href="/contact"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  お問い合わせフォームへ
                </a>
              </div>
            </section>
          </div>

          {/* フッターリンク */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <a href="/" className="text-purple-400 hover:underline">ホーム</a>
              <a href="/privacy" className="text-purple-400 hover:underline">プライバシーポリシー</a>
              <a href="/faq" className="text-purple-400 hover:underline">FAQ</a>
              <a href="/contact" className="text-purple-400 hover:underline">お問い合わせ</a>
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
