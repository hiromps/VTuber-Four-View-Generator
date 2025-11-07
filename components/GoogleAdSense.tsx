'use client'

import { useEffect } from 'react'

interface AdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  fullWidthResponsive?: boolean
  style?: React.CSSProperties
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
  style
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
    )
  }

  return (
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
  )
}

// AdSenseスクリプトローダー（layout.tsxで使用）
export function GoogleAdSenseScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  if (!clientId) return null

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
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
      />
    </div>
  )
}