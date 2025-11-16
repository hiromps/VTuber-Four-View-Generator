'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { AdRewardButton } from './AdRewardButton'

interface AdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  fullWidthResponsive?: boolean
  style?: React.CSSProperties
  showRewardButton?: boolean
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ''

export function GoogleAdSense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style,
  showRewardButton = false
}: AdSenseProps) {
  useEffect(() => {
    if (!ADSENSE_CLIENT_ID) return

    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  if (!ADSENSE_CLIENT_ID) {
    // 開発環境用のプレースホルダー
    return (
      <div className="space-y-4">
        <div
          style={{
            backgroundColor: '#f3f4f6',
            border: '2px dashed #9ca3af',
            padding: '20px',
            textAlign: 'center',
            color: '#6b7280',
            ...style
          }}
        >
          広告スペース
        </div>
        {showRewardButton && <AdRewardButton />}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style
        }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
      {showRewardButton && <AdRewardButton />}
    </div>
  )
}

// AdSenseスクリプトローダー（layout.tsxで使用）
export function GoogleAdSenseScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  if (!clientId) return null

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  )
}

// 広告配置用のプリセットコンポーネント
export function HeaderAd() {
  return (
    <div className="container mx-auto px-4 py-2">
      <GoogleAdSense
        adSlot="1234567890" // 実際のスロットIDに置き換え
        adFormat="horizontal"
        style={{ minHeight: '90px' }}
        showRewardButton={true}
      />
    </div>
  )
}

export function SidebarAd() {
  return (
    <div className="sticky top-4">
      <GoogleAdSense
        adSlot="0987654321" // 実際のスロットIDに置き換え
        adFormat="vertical"
        style={{ minHeight: '600px' }}
        showRewardButton={true}
      />
    </div>
  )
}

export function InArticleAd() {
  return (
    <div className="my-6">
      <GoogleAdSense
        adSlot="1122334455" // 実際のスロットIDに置き換え
        adFormat="fluid"
        showRewardButton={false}
      />
    </div>
  )
}

export function FooterAd() {
  return (
    <div className="container mx-auto px-4 py-4 border-t border-gray-700">
      <GoogleAdSense
        adSlot="5544332211" // 実際のスロットIDに置き換え
        adFormat="auto"
        style={{ minHeight: '100px' }}
        showRewardButton={true}
      />
    </div>
  )
}