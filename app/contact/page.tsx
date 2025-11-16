'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // TODO: 実際のAPI呼び出しを実装
      // 現在は仮のシミュレーション
      await new Promise(resolve => setTimeout(resolve, 1500))

      console.log('お問い合わせ内容:', formData)

      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        category: 'general',
        subject: '',
        message: '',
      })
    } catch (error) {
      console.error('送信エラー:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <div className="max-w-3xl mx-auto">
          {/* ページタイトル */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 text-center">お問い合わせ</h1>
            <p className="text-gray-400 text-center">
              ご質問やご要望がございましたら、お気軽にお問い合わせください
            </p>
          </div>

          {/* お問い合わせフォーム */}
          <div className="bg-gray-800 rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* お名前 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="山田 太郎"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              {/* お問い合わせカテゴリー */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  お問い合わせカテゴリー <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="general">一般的なお問い合わせ</option>
                  <option value="technical">技術的な問題</option>
                  <option value="billing">料金・トークンについて</option>
                  <option value="account">アカウントについて</option>
                  <option value="feature">機能リクエスト</option>
                  <option value="other">その他</option>
                </select>
              </div>

              {/* 件名 */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  件名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="お問い合わせの件名を入力してください"
                />
              </div>

              {/* お問い合わせ内容 */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="詳細をご記入ください"
                />
              </div>

              {/* 送信ボタン */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-lg font-semibold transition ${
                    isSubmitting
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {isSubmitting ? '送信中...' : '送信する'}
                </button>
              </div>

              {/* 送信ステータス */}
              {submitStatus === 'success' && (
                <div className="bg-green-900/50 border border-green-700 rounded-lg p-4">
                  <p className="text-green-300">
                    お問い合わせありがとうございます。内容を確認の上、2〜3営業日以内にご返信いたします。
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
                  <p className="text-red-300">
                    送信中にエラーが発生しました。時間をおいて再度お試しいただくか、メールで直接お問い合わせください。
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* その他の連絡方法 */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-purple-400">メールでのお問い合わせ</h3>
              <p className="text-gray-300 mb-4">
                フォームが利用できない場合は、直接メールでお問い合わせください。
              </p>
              <a
                href="mailto:support@vtuber-ai-generator.com"
                className="text-purple-400 hover:underline break-all"
              >
                support@vtuber-ai-generator.com
              </a>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-purple-400">営業時間</h3>
              <p className="text-gray-300 mb-2">平日: 10:00 - 18:00</p>
              <p className="text-gray-300 mb-4">土日祝日: 休業</p>
              <p className="text-sm text-gray-400">
                ※お問い合わせへの返信は2〜3営業日以内を目安としています
              </p>
            </div>
          </div>

          {/* FAQ案内 */}
          <div className="mt-12 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">よくある質問もご確認ください</h3>
            <p className="text-gray-300 mb-6">
              お問い合わせの前に、FAQで解決できる場合があります
            </p>
            <a
              href="/faq"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              FAQを見る
            </a>
          </div>

          {/* フッターリンク */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <a href="/" className="text-purple-400 hover:underline">ホーム</a>
              <a href="/privacy" className="text-purple-400 hover:underline">プライバシーポリシー</a>
              <a href="/terms" className="text-purple-400 hover:underline">利用規約</a>
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
