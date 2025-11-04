'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useLanguage } from '@/contexts/LanguageContext'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const TOKEN_PACKAGES = [
  {
    id: '5_tokens_first_time',
    name: '5 Tokens - First Time Only',
    tokens: 5,
    price: '$1.99',
    pricePerToken: '$0.40/token',
    popular: false,
    firstTimeOnly: true,
  },
  {
    id: '10_tokens',
    name: '10 Tokens',
    tokens: 10,
    price: '$4.99',
    pricePerToken: '$0.50/token',
    popular: false,
  },
  {
    id: '30_tokens',
    name: '30 Tokens',
    tokens: 30,
    price: '$11.99',
    pricePerToken: '$0.40/token',
    popular: true,
  },
  {
    id: '100_tokens',
    name: '100 Tokens',
    tokens: 100,
    price: '$29.99',
    pricePerToken: '$0.30/token',
    popular: false,
  },
]

interface BuyTokensModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BuyTokensModal({ isOpen, onClose }: BuyTokensModalProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasPurchased, setHasPurchased] = useState<boolean>(false)
  const [checkingHistory, setCheckingHistory] = useState<boolean>(true)

  // Check if user has already purchased
  useEffect(() => {
    const checkPurchaseHistory = async () => {
      try {
        const response = await fetch('/api/user/purchase-history')
        if (response.ok) {
          const data = await response.json()
          setHasPurchased(data.hasPurchased)
        }
      } catch (err) {
        console.error('Failed to check purchase history:', err)
      } finally {
        setCheckingHistory(false)
      }
    }

    if (isOpen) {
      checkPurchaseHistory()
    }
  }, [isOpen])

  if (!isOpen) return null

  // Filter out first-time-only packages if user has already purchased
  const availablePackages = TOKEN_PACKAGES.filter(
    pkg => !pkg.firstTimeOnly || !hasPurchased
  )

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('tokens.failedCheckout'))
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error(t('tokens.stripeFailed'))
      }

      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (err) {
      console.error('Purchase error:', err)
      setError(err instanceof Error ? err.message : t('tokens.purchaseError'))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-gray-800 rounded-lg p-5 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">{t('tokens.buyTokens')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-300 mb-2">{t('tokens.usage')}</h3>
          <ul className="text-sm md:text-base text-gray-400 space-y-1">
            <li>• {t('tokens.characterSheet')} <span className="text-white font-bold">4 {t('tokens.tokensLabel')}</span></li>
            <li>• {t('tokens.conceptArt')} <span className="text-white font-bold">1 {t('tokens.tokensLabel')}</span></li>
          </ul>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {checkingHistory ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-2">{t('tokens.checkingHistory') || 'Loading...'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {availablePackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-gray-700 rounded-lg p-4 md:p-6 border-2 transition ${
                  pkg.popular
                    ? 'border-purple-500'
                    : pkg.firstTimeOnly
                    ? 'border-green-500'
                    : 'border-transparent hover:border-gray-600'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t('tokens.mostPopular')}
                    </span>
                  </div>
                )}
                {pkg.firstTimeOnly && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t('tokens.firstTimeOnly') || 'First Time Only'}
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">{pkg.name}</h3>
                  <div className={`text-3xl md:text-4xl font-bold mb-2 ${
                    pkg.firstTimeOnly ? 'text-green-400' : 'text-purple-400'
                  }`}>
                    {pkg.price}
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6">{pkg.pricePerToken}</p>

                  <button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={loading === pkg.id}
                    className={`w-full font-bold py-2.5 md:py-3 px-4 rounded-lg transition text-sm md:text-base ${
                      pkg.firstTimeOnly
                        ? 'bg-green-600 hover:bg-green-700'
                        : pkg.popular
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gray-600 hover:bg-gray-500'
                    } disabled:bg-gray-500 disabled:cursor-not-allowed text-white`}
                  >
                    {loading === pkg.id ? t('tokens.processing') : t('tokens.buyNow')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-gray-400 text-sm mt-6 text-center">
          {t('tokens.securePayment')}
        </p>
      </div>
    </div>
  )
}
