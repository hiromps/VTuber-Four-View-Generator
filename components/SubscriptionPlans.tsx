'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PlanFeature {
  text: string
  included: boolean
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  priceId?: string // Stripe Price ID
  tokens: number
  features: PlanFeature[]
  popular?: boolean
  savings?: number
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'ベーシック',
    price: 980,
    tokens: 30,
    features: [
      { text: '毎月30トークン', included: true },
      { text: '四面図生成（7回分）', included: true },
      { text: '標準処理速度', included: true },
      { text: '商用利用可能', included: true },
      { text: '優先サポート', included: false },
      { text: '高解像度出力', included: false },
    ],
  },
  {
    id: 'standard',
    name: 'スタンダード',
    price: 2480,
    tokens: 100,
    popular: true,
    savings: 520,
    features: [
      { text: '毎月100トークン', included: true },
      { text: '四面図生成（25回分）', included: true },
      { text: '高速処理', included: true },
      { text: '商用利用可能', included: true },
      { text: '優先サポート', included: true },
      { text: '高解像度出力（2K）', included: true },
    ],
  },
  {
    id: 'premium',
    name: 'プレミアム',
    price: 4980,
    tokens: 300,
    savings: 2520,
    features: [
      { text: '毎月300トークン', included: true },
      { text: '四面図生成（75回分）', included: true },
      { text: '最優先処理', included: true },
      { text: '商用利用可能', included: true },
      { text: '専用サポート', included: true },
      { text: '最高解像度出力（4K）', included: true },
    ],
  },
]

export default function SubscriptionPlans({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage()
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true)
    setSelectedPlan(planId)

    try {
      // サブスクリプションチェックアウトセッション作成
      const response = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create subscription session')
      }

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      // Stripe Checkoutへリダイレクト
      const { error } = await stripe.redirectToCheckout({ sessionId })

      if (error) {
        console.error('Stripe redirect error:', error)
        throw error
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
      setSelectedPlan('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">月額プランで更にお得に</h2>
            <p className="text-gray-400 text-sm mt-1">毎月自動でトークンが追加されます</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* プラン一覧 */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl p-6 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500'
                    : 'bg-gray-800 border border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      人気プラン
                    </span>
                  </div>
                )}

                {/* プラン名と価格 */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-3xl font-bold text-white">¥{plan.price.toLocaleString()}</span>
                    <span className="text-gray-400 mb-1">/月</span>
                  </div>
                  {plan.savings && (
                    <div className="mt-2">
                      <span className="bg-green-900/50 text-green-400 text-xs font-semibold px-2 py-1 rounded">
                        ¥{plan.savings.toLocaleString()}お得
                      </span>
                    </div>
                  )}
                  <div className="mt-3 text-purple-400 font-semibold">
                    {plan.tokens}トークン/月
                  </div>
                </div>

                {/* 特徴リスト */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {feature.included ? (
                        <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-500'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* 購入ボタン */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      処理中...
                    </span>
                  ) : (
                    '今すぐ始める'
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* 補足情報 */}
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-white mb-2">サブスクリプションについて</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• いつでもキャンセル可能です</li>
              <li>• トークンは毎月自動で追加されます</li>
              <li>• 未使用のトークンは翌月に繰り越されません</li>
              <li>• プラン変更は次回請求日から適用されます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}