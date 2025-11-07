'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import ReactGA from 'react-ga4'

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ''

export const initGA = () => {
  if (GA_TRACKING_ID && typeof window !== 'undefined') {
    ReactGA.initialize(GA_TRACKING_ID, {
      gaOptions: {
        anonymizeIp: true,
      },
    })
  }
}

export const logPageView = (url: string) => {
  if (GA_TRACKING_ID && typeof window !== 'undefined') {
    ReactGA.send({ hitType: 'pageview', page: url })
  }
}

export const logEvent = (action: string, category: string, label?: string, value?: number) => {
  if (GA_TRACKING_ID && typeof window !== 'undefined') {
    ReactGA.event({
      action,
      category,
      label,
      value,
    })
  }
}

// カスタムイベント用の便利な関数
export const trackEvents = {
  // ユーザー登録・ログイン
  signUp: () => logEvent('sign_up', 'User', 'Email'),
  login: () => logEvent('login', 'User'),
  logout: () => logEvent('logout', 'User'),

  // 画像生成
  generateSheet: (tokensUsed: number) =>
    logEvent('generate_sheet', 'Generation', 'Character Sheet', tokensUsed),
  generateExpressions: (tokensUsed: number) =>
    logEvent('generate_expressions', 'Generation', 'Expressions', tokensUsed),
  generateConcept: () =>
    logEvent('generate_concept', 'Generation', 'Concept Art', 1),

  // 購入
  purchaseTokens: (amount: number, tokens: number) =>
    logEvent('purchase', 'Revenue', `${tokens} tokens`, amount),

  // ダウンロード
  downloadImage: (type: string) =>
    logEvent('download', 'Engagement', type),
  shareToX: (type: string) =>
    logEvent('share', 'Social', `X - ${type}`),

  // エラー
  generationError: (errorType: string) =>
    logEvent('generation_error', 'Error', errorType),
  paymentError: (errorType: string) =>
    logEvent('payment_error', 'Error', errorType),
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    initGA()
  }, [])

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    logPageView(url)
  }, [pathname, searchParams])

  // Google Analytics 4 Script (fallback)
  if (!GA_TRACKING_ID) return null

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true
            });
          `,
        }}
      />
    </>
  )
}