'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const TOKEN_PACKAGES = [
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
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

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
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
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
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Buy Tokens</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Token Usage:</h3>
          <ul className="text-gray-400 space-y-1">
            <li>• Character Sheet (4 views): <span className="text-white font-bold">4 tokens</span></li>
            <li>• Concept Art (1 image): <span className="text-white font-bold">1 token</span></li>
          </ul>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOKEN_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-gray-700 rounded-lg p-6 border-2 transition ${
                pkg.popular
                  ? 'border-purple-500'
                  : 'border-transparent hover:border-gray-600'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  {pkg.price}
                </div>
                <p className="text-gray-400 text-sm mb-6">{pkg.pricePerToken}</p>

                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`w-full font-bold py-3 px-4 rounded-lg transition ${
                    pkg.popular
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-gray-600 hover:bg-gray-500'
                  } disabled:bg-gray-500 disabled:cursor-not-allowed text-white`}
                >
                  {loading === pkg.id ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Secure payment powered by Stripe
        </p>
      </div>
    </div>
  )
}
