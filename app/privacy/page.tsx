import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'VTuber四面図AIのプライバシーポリシー。個人情報の取り扱いについて説明します。',
  openGraph: {
    title: 'プライバシーポリシー | VTuber四面図AI',
    description: '個人情報の取り扱いについて',
  },
}

export default function PrivacyPage() {
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
            <h1 className="text-4xl font-bold mb-4">プライバシーポリシー</h1>
            <p className="text-gray-400">最終更新日: 2024年12月17日</p>
          </div>

          {/* コンテンツ */}
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">1. はじめに</h2>
              <p className="leading-relaxed">
                VTuber四面図AI（以下「当サービス」）は、ユーザーの皆様のプライバシーを尊重し、個人情報の保護に努めます。
                本プライバシーポリシーは、当サービスがどのような個人情報を収集し、どのように利用・管理するかを説明するものです。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">2. 収集する情報</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">2.1 アカウント情報</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>メールアドレス</li>
                    <li>ユーザー名</li>
                    <li>認証情報</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">2.2 利用情報</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>アップロードされた画像データ</li>
                    <li>生成された画像データ</li>
                    <li>トークン使用履歴</li>
                    <li>サービス利用履歴</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">2.3 自動的に収集される情報</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>IPアドレス</li>
                    <li>ブラウザの種類とバージョン</li>
                    <li>デバイス情報</li>
                    <li>アクセス日時</li>
                    <li>Cookie情報</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">2.4 決済情報</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>決済履歴（Stripe経由で処理、当サービスではクレジットカード情報を保存しません）</li>
                    <li>購入履歴</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">3. 情報の利用目的</h2>
              <p className="mb-4">収集した情報は、以下の目的で利用します：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>サービスの提供・運営</li>
                <li>AI画像生成機能の提供</li>
                <li>ユーザー認証とアカウント管理</li>
                <li>決済処理とトークン管理</li>
                <li>カスタマーサポート対応</li>
                <li>サービスの改善・最適化</li>
                <li>利用状況の分析</li>
                <li>不正利用の防止</li>
                <li>法令遵守</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">4. 第三者サービスの利用</h2>
              <p className="mb-4">当サービスは、以下の第三者サービスを利用しています：</p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">4.1 Google Analytics</h3>
                  <p>アクセス解析のため、Google Analyticsを使用しています。詳細は<a href="https://policies.google.com/privacy" className="text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">Googleプライバシーポリシー</a>をご覧ください。</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">4.2 Google AdSense</h3>
                  <p>広告配信のため、Google AdSenseを使用しています。Cookieを使用してユーザーの興味関心に基づく広告を表示する場合があります。</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">4.3 Stripe</h3>
                  <p>決済処理のため、Stripeを使用しています。クレジットカード情報は当サービスでは保存せず、Stripeが安全に処理します。</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">4.4 Supabase</h3>
                  <p>データベースと認証機能のため、Supabaseを使用しています。</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">4.5 Google Gemini API</h3>
                  <p>AI画像生成のため、Google Gemini APIを使用しています。アップロードされた画像はAPI処理のためGoogleに送信されますが、Googleのポリシーに従って処理されます。</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">5. Cookieの使用</h2>
              <p className="mb-4">
                当サービスは、ユーザー体験の向上とサービス分析のためにCookieを使用します。
                Cookieの使用を希望されない場合は、ブラウザの設定で無効化できますが、一部機能が制限される場合があります。
              </p>
              <div className="space-y-2 ml-4">
                <p><strong>必須Cookie:</strong> サービスの基本機能に必要</p>
                <p><strong>分析Cookie:</strong> サービス改善のための利用状況分析</p>
                <p><strong>広告Cookie:</strong> 関連性の高い広告表示</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">6. 情報の共有と開示</h2>
              <p className="mb-4">当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に開示しません：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ユーザーの同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人命・身体・財産の保護に必要な場合</li>
                <li>サービス提供に必要な範囲で、業務委託先に開示する場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">7. データの保存と削除</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">7.1 データの保存期間</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>アカウント情報: アカウント削除まで</li>
                    <li>生成画像: ユーザーが削除するまで、または30日間未アクセスの場合</li>
                    <li>取引履歴: 法令で定められた期間</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">7.2 データの削除</h3>
                  <p>アカウント削除時、または削除リクエストにより個人情報を削除します。ただし、法令で保存が義務付けられている情報は例外とします。</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">8. セキュリティ</h2>
              <p>
                当サービスは、個人情報の漏洩・滅失・毀損を防止するため、適切なセキュリティ対策を実施しています。
                ただし、インターネット通信の完全な安全性を保証するものではありません。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">9. ユーザーの権利</h2>
              <p className="mb-4">ユーザーは、以下の権利を有します：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>個人情報の開示請求</li>
                <li>個人情報の訂正・追加・削除請求</li>
                <li>個人情報の利用停止請求</li>
                <li>アカウントの削除</li>
              </ul>
              <p className="mt-4">これらの権利行使については、お問い合わせページよりご連絡ください。</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">10. 子供のプライバシー</h2>
              <p>
                当サービスは、13歳未満の子供から意図的に個人情報を収集しません。
                保護者の方が、お子様が当サービスに個人情報を提供したことに気付かれた場合は、速やかにご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">11. プライバシーポリシーの変更</h2>
              <p>
                当サービスは、必要に応じて本プライバシーポリシーを変更することがあります。
                変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。
                重要な変更がある場合は、サービス内で通知します。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">12. お問い合わせ</h2>
              <p className="mb-4">
                プライバシーポリシーに関するご質問やご不明な点がございましたら、以下よりお問い合わせください。
              </p>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="mb-2"><strong>お問い合わせ先:</strong></p>
                <p className="mb-4">VTuber四面図AI サポート窓口</p>
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
              <a href="/terms" className="text-purple-400 hover:underline">利用規約</a>
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
