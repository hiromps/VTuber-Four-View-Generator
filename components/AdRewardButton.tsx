'use client'

import { useState, useEffect } from 'react'

interface AdRewardButtonProps {
  onRewardClaimed?: (newBalance: number) => void
}

export function AdRewardButton({ onRewardClaimed }: AdRewardButtonProps) {
  const [loading, setLoading] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null)
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')

  // クーリングタイムをチェック
  useEffect(() => {
    checkCooldown()
  }, [])

  const checkCooldown = async () => {
    try {
      const response = await fetch('/api/tokens/reward-ad-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (response.status === 429) {
        // クーリングタイム中
        setCooldownRemaining(data.cooldownRemaining)
      }
    } catch (error) {
      console.error('Error checking cooldown:', error)
    }
  }

  const claimReward = async () => {
    if (loading || cooldownRemaining) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/tokens/reward-ad-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage(`🎉 ${data.message}`)
        setMessageType('success')
        setCooldownRemaining(24) // 24時間のクーリングタイム開始

        // トークン残高を更新（親コンポーネントに通知）
        if (onRewardClaimed) {
          onRewardClaimed(data.newBalance)
        }

        // ページをリロードしてトークン残高を更新
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else if (response.status === 429) {
        // クーリングタイム中
        setMessage(data.message || 'Please wait before claiming your next reward.')
        setMessageType('info')
        setCooldownRemaining(data.cooldownRemaining)
      } else if (response.status === 401) {
        // 未ログイン
        setMessage('Please sign in to earn tokens from ads.')
        setMessageType('error')
      } else {
        setMessage(data.error || 'Failed to claim reward. Please try again.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error claiming ad reward:', error)
      setMessage('An error occurred. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = loading || cooldownRemaining !== null

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
      <div className="text-center">
        <p className="text-sm text-gray-300 mb-1">
          {cooldownRemaining
            ? `次の報酬まで ${cooldownRemaining}時間`
            : '広告を見て無料トークンをゲット！'
          }
        </p>
        <p className="text-xs text-gray-400">
          1日1回、広告を見ると1トークンもらえます
        </p>
      </div>

      <button
        onClick={claimReward}
        disabled={isDisabled}
        className={`
          px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200
          ${isDisabled
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105 shadow-lg hover:shadow-purple-500/50'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            処理中...
          </span>
        ) : cooldownRemaining ? (
          `⏰ クールダウン中 (${cooldownRemaining}h)`
        ) : (
          '🎁 1トークン獲得'
        )}
      </button>

      {message && (
        <div className={`
          text-sm p-2 rounded-md w-full text-center
          ${messageType === 'success' ? 'bg-green-900/50 text-green-300' : ''}
          ${messageType === 'error' ? 'bg-red-900/50 text-red-300' : ''}
          ${messageType === 'info' ? 'bg-blue-900/50 text-blue-300' : ''}
        `}>
          {message}
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        💡 ヒント: 毎日ログインして広告を見れば、無料でサービスを利用できます
      </p>
    </div>
  )
}
