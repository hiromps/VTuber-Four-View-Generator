'use client'

import React, { useState, useCallback, useEffect } from 'react'
import JSZip from 'jszip'
import { fileToData } from '@/utils/imageUtils'
import { ViewType, GeneratedImages, AspectRatio, UploadedFile, ExpressionType, GeneratedExpressions } from '@/types'
import { createClient } from '@/lib/supabase/client'
import AuthModal from '@/components/AuthModal'
import TokenDisplay from '@/components/TokenDisplay'
import BuyTokensModal from '@/components/BuyTokensModal'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'
import type { User } from '@supabase/supabase-js'

// SVG Icon Components
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
)

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
)

const LoadingSpinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
    </div>
)

const ImagePlaceholder = ({ label }: { label: string }) => (
    <div className="bg-gray-800 w-full h-full rounded-lg flex flex-col justify-center items-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
        <span className="text-sm font-medium text-center px-2">{label}</span>
    </div>
)

export default function Home() {
    const { t } = useLanguage()
    const [user, setUser] = useState<User | null>(null)
    const [tokens, setTokens] = useState(0)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [showBuyModal, setShowBuyModal] = useState(false)
    const [activeTab, setActiveTab] = useState<'sheet' | 'concept' | 'expressions'>('sheet')
    const [authError, setAuthError] = useState<string | null>(null)
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [paymentCanceled, setPaymentCanceled] = useState(false)

    // Character Sheet State
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
    const [generatedImages, setGeneratedImages] = useState<GeneratedImages>({ front: null, back: null, left: null, right: null })
    const [isSheetLoading, setIsSheetLoading] = useState(false)
    const [isZipping, setIsZipping] = useState(false)
    const [sheetError, setSheetError] = useState<string | null>(null)
    const [sheetAdditionalPrompt, setSheetAdditionalPrompt] = useState<string>('')

    // Concept Art State
    const [prompt, setPrompt] = useState<string>('A cyberpunk VTuber with neon hair and holographic cat ears')
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4')
    const [conceptImage, setConceptImage] = useState<string | null>(null)
    const [isConceptLoading, setIsConceptLoading] = useState(false)
    const [conceptError, setConceptError] = useState<string | null>(null)

    // Facial Expressions State
    const [expressionsImages, setExpressionsImages] = useState<GeneratedExpressions>({ joy: null, anger: null, sorrow: null, surprise: null })
    const [isExpressionsLoading, setIsExpressionsLoading] = useState(false)
    const [isExpressionsZipping, setIsExpressionsZipping] = useState(false)
    const [expressionsError, setExpressionsError] = useState<string | null>(null)
    const [expressionsAdditionalPrompt, setExpressionsAdditionalPrompt] = useState<string>('')

    const expressionLabels: { [key in ExpressionType]: string } = {
        joy: t('expressions.joy'),
        anger: t('expressions.anger'),
        sorrow: t('expressions.sorrow'),
        surprise: t('expressions.surprise'),
    }

    const supabase = createClient()

    // Check for auth errors and payment status in URL
    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const error = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')
        const errorCode = hashParams.get('error_code')

        if (error) {
            let message = 'Authentication error occurred.'

            if (errorCode === 'otp_expired') {
                message = t('auth.otpExpired')
            } else if (errorDescription) {
                message = decodeURIComponent(errorDescription)
            }

            setAuthError(message)

            // Clear error from URL after 5 seconds
            setTimeout(() => {
                setAuthError(null)
                window.history.replaceState({}, document.title, window.location.pathname)
            }, 5000)
        }

        // Check for payment success/cancel in query params
        const searchParams = new URLSearchParams(window.location.search)
        const success = searchParams.get('success')
        const canceled = searchParams.get('canceled')

        let pollingIntervalId: NodeJS.Timeout | null = null

        if (success === 'true') {
            setPaymentSuccess(true)

            // Poll for token updates (webhook processing may take a few seconds)
            const initialTokens = tokens
            const maxAttempts = 10 // Poll for up to 30 seconds
            let attempts = 0

            console.log('Payment successful! Starting token polling...')
            console.log(`Initial tokens: ${initialTokens}`)

            pollingIntervalId = setInterval(async () => {
                attempts++
                console.log(`[Token Polling] Attempt ${attempts}/${maxAttempts}`)

                try {
                    const response = await fetch('/api/tokens')
                    if (response.ok) {
                        const data = await response.json()
                        console.log(`[Token Polling] Current: ${data.tokens}, Initial: ${initialTokens}`)

                        // Update tokens state
                        setTokens(data.tokens)

                        // If tokens increased, stop polling
                        if (data.tokens > initialTokens) {
                            console.log('✅ [Token Polling] Tokens updated successfully!')
                            if (pollingIntervalId) clearInterval(pollingIntervalId)
                        }
                    }
                } catch (error) {
                    console.error('❌ [Token Polling] Error:', error)
                }

                if (attempts >= maxAttempts) {
                    console.log('⏱️ [Token Polling] Max attempts reached. Stopping...')
                    console.warn('⚠️ If tokens did not update, check:')
                    console.warn('  1. Stripe webhook is configured correctly')
                    console.warn('  2. Webhook endpoint is accessible')
                    console.warn('  3. STRIPE_WEBHOOK_SECRET is set correctly')
                    if (pollingIntervalId) clearInterval(pollingIntervalId)
                }
            }, 3000) // Poll every 3 seconds

            // Clear URL parameter after 10 seconds
            setTimeout(() => {
                setPaymentSuccess(false)
                window.history.replaceState({}, document.title, window.location.pathname)
            }, 10000)
        }

        if (canceled === 'true') {
            setPaymentCanceled(true)
            // Clear URL parameter after 5 seconds
            setTimeout(() => {
                setPaymentCanceled(false)
                window.history.replaceState({}, document.title, window.location.pathname)
            }, 5000)
        }

        // Cleanup interval on unmount
        return () => {
            if (pollingIntervalId) {
                clearInterval(pollingIntervalId)
            }
        }
    }, [user, tokens])

    // Check authentication and fetch tokens
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                fetchTokens()
            }
        }
        checkAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchTokens()
            } else {
                setTokens(0)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchTokens = async () => {
        try {
            const response = await fetch('/api/tokens')
            if (response.ok) {
                const data = await response.json()
                setTokens(data.tokens)
            }
        } catch (error) {
            console.error('Error fetching tokens:', error)
        }
    }

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        setUser(null)
        setTokens(0)
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            try {
                const data = await fileToData(file)
                setUploadedFile(data)
                setGeneratedImages({ front: null, back: null, left: null, right: null })
                setSheetError(null)
                setExpressionsImages({ joy: null, anger: null, sorrow: null, surprise: null })
                setExpressionsError(null)
            } catch (error) {
                console.error("Error processing file:", error)
                const errorMessage = t('errors.uploadImage')
                setSheetError(errorMessage)
                setExpressionsError(errorMessage)
            }
        }
    }

    const handleGenerateSheet = useCallback(async () => {
        if (!user) {
            setShowAuthModal(true)
            return
        }

        if (!uploadedFile) {
            setSheetError(t('errors.uploadImage'))
            return
        }

        if (tokens < 4) {
            setSheetError(t('errors.insufficientTokensSheet'))
            setShowBuyModal(true)
            return
        }

        setIsSheetLoading(true)
        setSheetError(null)
        setGeneratedImages({ front: null, back: null, left: null, right: null })

        try {
            const response = await fetch('/api/generate/sheet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    base64Image: uploadedFile.base64,
                    mimeType: uploadedFile.mimeType,
                    additionalPrompt: sheetAdditionalPrompt,
                }),
            })

            // レスポンスのコンテンツタイプをチェック
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text()
                console.error('Non-JSON response:', text)
                throw new Error('画像サイズが大きすぎるか、サーバーエラーが発生しました。より小さい画像をお試しください。')
            }

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate character sheet')
            }

            // Update tokens
            setTokens(data.tokens)

            // Set all generated images
            setGeneratedImages(data.images)

        } catch (error) {
            console.error("Error generating character sheet:", error)
            if (error instanceof Error && error.message.includes('JSON')) {
                setSheetError('画像サイズが大きすぎる可能性があります。より小さい画像をお試しください。')
            } else {
                setSheetError(error instanceof Error ? error.message : "An unknown error occurred.")
            }
        } finally {
            setIsSheetLoading(false)
        }
    }, [user, uploadedFile, tokens])

    const handleGenerateConcept = useCallback(async () => {
        if (!user) {
            setShowAuthModal(true)
            return
        }

        if (!prompt) {
            setConceptError(t('errors.enterPrompt'))
            return
        }

        if (tokens < 1) {
            setConceptError(t('errors.insufficientTokensConcept'))
            setShowBuyModal(true)
            return
        }

        setIsConceptLoading(true)
        setConceptError(null)
        setConceptImage(null)

        try {
            const response = await fetch('/api/generate/concept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, aspectRatio }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate concept art')
            }

            setConceptImage(data.imageUrl)
            setTokens(data.tokens)
        } catch (error) {
            console.error("Error generating concept art:", error)
            setConceptError(error instanceof Error ? error.message : "An unknown error occurred.")
        } finally {
            setIsConceptLoading(false)
        }
    }, [user, prompt, aspectRatio, tokens])

    const handleGenerateExpressions = useCallback(async () => {
        if (!user) {
            setShowAuthModal(true)
            return
        }

        if (!uploadedFile) {
            setExpressionsError(t('errors.uploadImage'))
            return
        }

        if (tokens < 4) {
            setExpressionsError(t('errors.insufficientTokensExpressions'))
            setShowBuyModal(true)
            return
        }

        setIsExpressionsLoading(true)
        setExpressionsError(null)
        setExpressionsImages({ joy: null, anger: null, sorrow: null, surprise: null })

        try {
            const response = await fetch('/api/generate/expressions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    base64Image: uploadedFile.base64,
                    mimeType: uploadedFile.mimeType,
                    additionalPrompt: expressionsAdditionalPrompt,
                }),
            })

            // レスポンスのコンテンツタイプをチェック
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text()
                console.error('Non-JSON response:', text)
                throw new Error('画像サイズが大きすぎるか、サーバーエラーが発生しました。より小さい画像をお試しください。')
            }

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate facial expressions')
            }

            setTokens(data.tokens)
            setExpressionsImages(data.images)

        } catch (error) {
            console.error("Error generating facial expressions:", error)
            if (error instanceof Error && error.message.includes('JSON')) {
                setExpressionsError('画像サイズが大きすぎる可能性があります。より小さい画像をお試しください。')
            } else {
                setExpressionsError(error instanceof Error ? error.message : "An unknown error occurred.")
            }
        } finally {
            setIsExpressionsLoading(false)
        }
    }, [user, uploadedFile, tokens])

    const handleDownloadSingle = (src: string, filename: string) => {
        if (!src) return
        const link = document.createElement("a")
        link.href = src
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleDownloadAll = useCallback(async () => {
        const imagesToZip = Object.entries(generatedImages).filter((entry): entry is [string, string] => entry[1] !== null)
        if (imagesToZip.length === 0) return

        setIsZipping(true)
        try {
            const zip = new JSZip()

            const fetchPromises = imagesToZip.map(([view, src]) =>
                fetch(src)
                    .then((res) => res.blob())
                    .then((blob) => {
                        const fileExtension = blob.type.split('/')[1] || 'png'
                        zip.file(`${view}.${fileExtension}`, blob)
                    })
            )

            await Promise.all(fetchPromises)
            const zipBlob = await zip.generateAsync({ type: 'blob' })
            const url = URL.createObjectURL(zipBlob)
            handleDownloadSingle(url, 'vtuber-character-sheet.zip')
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error creating zip file:", error)
            setSheetError(t('errors.failedZip'))
        } finally {
            setIsZipping(false)
        }
    }, [generatedImages])

    const handleDownloadAllExpressions = useCallback(async () => {
        const imagesToZip = Object.entries(expressionsImages).filter((entry): entry is [string, string] => entry[1] !== null)
        if (imagesToZip.length === 0) return

        setIsExpressionsZipping(true)
        try {
            const zip = new JSZip()

            const fetchPromises = imagesToZip.map(([expression, src]) =>
                fetch(src)
                    .then((res) => res.blob())
                    .then((blob) => {
                        const fileExtension = blob.type.split('/')[1] || 'png'
                        zip.file(`${expression}.${fileExtension}`, blob)
                    })
            )

            await Promise.all(fetchPromises)
            const zipBlob = await zip.generateAsync({ type: 'blob' })
            const url = URL.createObjectURL(zipBlob)
            handleDownloadSingle(url, 'vtuber-expressions.zip')
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error creating zip file:", error)
            setExpressionsError(t('errors.failedZip'))
        } finally {
            setIsExpressionsZipping(false)
        }
    }, [expressionsImages])

    const hasAnyGeneratedImages = Object.values(generatedImages).some(img => img !== null)
    const hasAnyGeneratedExpressionImages = Object.values(expressionsImages).some(img => img !== null)

    const TabButton: React.FC<{ tabId: 'sheet' | 'concept' | 'expressions'; children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-3 sm:px-4 md:px-6 py-2 md:py-2.5 text-xs sm:text-sm md:text-base font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
                activeTab === tabId
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
            {children}
        </button>
    )

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-3 md:p-4 sticky top-0 z-10">
                <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        {t('app.title')}
                    </h1>
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center">
                        <LanguageSwitcher />
                        {user ? (
                            <>
                                <TokenDisplay tokens={tokens} onBuyTokens={() => setShowBuyModal(true)} />
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-300 hover:text-white transition"
                                >
                                    {t('app.logout')}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 md:px-6 rounded-lg transition text-sm md:text-base"
                            >
                                {t('app.signIn')}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Auth Error Banner */}
            {authError && (
                <div className="bg-red-500/10 border-l-4 border-red-500 p-3 md:p-4">
                    <div className="container mx-auto flex items-start gap-2 md:gap-3">
                        <div className="flex-shrink-0">
                            <svg className="h-4 w-4 md:h-5 md:w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm text-red-400 break-words">{authError}</p>
                        </div>
                        <button
                            onClick={() => setAuthError(null)}
                            className="flex-shrink-0 text-red-400 hover:text-red-300"
                        >
                            <svg className="h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Success Banner */}
            {paymentSuccess && (
                <div className="bg-green-500/10 border-l-4 border-green-500 p-3 md:p-4">
                    <div className="container mx-auto flex items-start gap-2 md:gap-3">
                        <div className="flex-shrink-0">
                            <svg className="h-4 w-4 md:h-5 md:w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm text-green-400 break-words">{t('tokens.paymentSuccess')}</p>
                        </div>
                        <button
                            onClick={() => setPaymentSuccess(false)}
                            className="flex-shrink-0 text-green-400 hover:text-green-300"
                        >
                            <svg className="h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Canceled Banner */}
            {paymentCanceled && (
                <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 md:p-4">
                    <div className="container mx-auto flex items-start gap-2 md:gap-3">
                        <div className="flex-shrink-0">
                            <svg className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm text-yellow-400 break-words">{t('tokens.paymentCanceled')}</p>
                        </div>
                        <button
                            onClick={() => setPaymentCanceled(false)}
                            className="flex-shrink-0 text-yellow-400 hover:text-yellow-300"
                        >
                            <svg className="h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <main className="container mx-auto p-3 sm:p-4 md:p-8">
                <div className="flex justify-center mb-4 md:mb-6 gap-2 md:gap-4 flex-wrap">
                    <TabButton tabId="sheet">{t('tabs.characterSheet')}</TabButton>
                    <TabButton tabId="expressions">{t('tabs.expressions')}</TabButton>
                    <TabButton tabId="concept">{t('tabs.conceptArt')}</TabButton>
                </div>

                {activeTab === 'sheet' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                        {/* Controls */}
                        <div className="lg:col-span-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg flex flex-col space-y-4 md:space-y-6 h-fit">
                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">1. {t('upload.title')}</h2>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadIcon />
                                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">{t('upload.clickToUpload')}</span> {t('upload.dragAndDrop')}</p>
                                        <p className="text-xs text-gray-500">{t('upload.fileTypes')}</p>
                                    </div>
                                    <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                                </label>
                            </div>

                            {uploadedFile?.objectURL && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-300 mb-2">{t('upload.preview')}</p>
                                    <img src={uploadedFile.objectURL} alt="Uploaded preview" className="rounded-lg w-full max-h-64 object-contain" />
                                </div>
                            )}

                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">2. {t('customize.title')}</h2>
                            <div>
                                <label htmlFor="sheet-additional-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('customize.additionalInstructions')}
                                </label>
                                <textarea
                                    id="sheet-additional-prompt"
                                    rows={3}
                                    value={sheetAdditionalPrompt}
                                    onChange={(e) => setSheetAdditionalPrompt(e.target.value)}
                                    placeholder={t('customize.placeholder')}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    {t('customize.hint')}
                                </p>
                            </div>

                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">3. {t('generate.sheetTitle')}</h2>
                            <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-300">
                                {t('generate.cost')} <span className="font-bold text-yellow-400">4 {t('generate.tokens')}</span>
                            </div>
                            <button
                                onClick={handleGenerateSheet}
                                disabled={!uploadedFile || isSheetLoading}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2.5 md:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-sm md:text-base"
                            >
                                {isSheetLoading ? t('generate.generating') : t('generate.generateSheet')}
                            </button>
                            {sheetError && <p className="text-red-400 text-sm mt-2">{sheetError}</p>}
                        </div>

                        {/* Results */}
                        <div className="lg:col-span-2 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                                <h2 className="text-lg md:text-xl font-semibold">{t('results.generatedViews')}</h2>
                                {hasAnyGeneratedImages && (
                                    <button
                                        onClick={handleDownloadAll}
                                        disabled={isZipping || isSheetLoading}
                                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-3 md:px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-xs md:text-sm gap-1.5 md:gap-2 w-full sm:w-auto"
                                    >
                                        <DownloadIcon />
                                        <span>{isZipping ? t('results.zipping') : t('results.downloadAll')}</span>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                {isSheetLoading && (['front', 'back', 'left', 'right'] as ViewType[]).map(view => (
                                     <div key={view} className="flex flex-col items-center space-y-2">
                                        <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center"><LoadingSpinner/></div>
                                        <p className="text-sm text-gray-400 capitalize">{view}</p>
                                    </div>
                                ))}
                                {!isSheetLoading && (Object.keys(generatedImages) as ViewType[]).map((key) => {
                                    const src = generatedImages[key]
                                    return (
                                        <div key={key} className="flex flex-col items-center space-y-2">
                                            <div className="w-full aspect-square relative group bg-gray-700 rounded-lg">
                                                {src ? (
                                                    <>
                                                        <img src={src} alt={`${key} view`} className="w-full h-full object-cover rounded-lg" />
                                                        <button
                                                            onClick={() => handleDownloadSingle(src, `${key}.png`)}
                                                            className="absolute bottom-2 right-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-1.5 rounded-full transition-opacity duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                            aria-label={`Download ${key} view`}
                                                            title={`Download ${key} view`}
                                                        >
                                                            <DownloadIcon />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <ImagePlaceholder label={key.charAt(0).toUpperCase() + key.slice(1)} />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 capitalize">{key}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'expressions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                        {/* Controls */}
                        <div className="lg:col-span-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg flex flex-col space-y-4 md:space-y-6 h-fit">
                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">1. {t('upload.title')}</h2>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file-expressions" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadIcon />
                                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">{t('upload.clickToUpload')}</span> {t('upload.dragAndDrop')}</p>
                                        <p className="text-xs text-gray-500">{t('upload.fileTypes')}</p>
                                    </div>
                                    <input id="dropzone-file-expressions" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                                </label>
                            </div>

                            {uploadedFile?.objectURL && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-300 mb-2">{t('upload.preview')}</p>
                                    <img src={uploadedFile.objectURL} alt="Uploaded preview" className="rounded-lg w-full max-h-64 object-contain" />
                                </div>
                            )}

                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">2. {t('customize.title')}</h2>
                            <div>
                                <label htmlFor="expressions-additional-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('customize.additionalInstructions')}
                                </label>
                                <textarea
                                    id="expressions-additional-prompt"
                                    rows={3}
                                    value={expressionsAdditionalPrompt}
                                    onChange={(e) => setExpressionsAdditionalPrompt(e.target.value)}
                                    placeholder={t('customize.placeholder')}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    {t('customize.hint')}
                                </p>
                            </div>

                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">3. {t('generate.expressionsTitle')}</h2>
                            <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-300">
                                {t('generate.cost')} <span className="font-bold text-yellow-400">4 {t('generate.tokens')}</span>
                            </div>
                            <button
                                onClick={handleGenerateExpressions}
                                disabled={!uploadedFile || isExpressionsLoading}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2.5 md:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-sm md:text-base"
                            >
                                {isExpressionsLoading ? t('generate.generating') : t('generate.generateExpressions')}
                            </button>
                            {expressionsError && <p className="text-red-400 text-sm mt-2">{expressionsError}</p>}
                        </div>

                        {/* Results */}
                        <div className="lg:col-span-2 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                                <h2 className="text-lg md:text-xl font-semibold">{t('results.generatedExpressions')}</h2>
                                {hasAnyGeneratedExpressionImages && (
                                    <button
                                        onClick={handleDownloadAllExpressions}
                                        disabled={isExpressionsZipping || isExpressionsLoading}
                                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-3 md:px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-xs md:text-sm gap-1.5 md:gap-2 w-full sm:w-auto"
                                    >
                                        <DownloadIcon />
                                        <span>{isExpressionsZipping ? t('results.zipping') : t('results.downloadAll')}</span>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                {isExpressionsLoading && (Object.keys(expressionsImages) as ExpressionType[]).map(exp => (
                                     <div key={exp} className="flex flex-col items-center space-y-2">
                                        <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center"><LoadingSpinner/></div>
                                        <p className="text-sm text-gray-400 capitalize">{expressionLabels[exp]}</p>
                                    </div>
                                ))}
                                {!isExpressionsLoading && (Object.keys(expressionsImages) as ExpressionType[]).map((key) => {
                                    const src = expressionsImages[key]
                                    return (
                                        <div key={key} className="flex flex-col items-center space-y-2">
                                            <div className="w-full aspect-square relative group bg-gray-700 rounded-lg">
                                                {src ? (
                                                    <>
                                                        <img src={src} alt={`${key} expression`} className="w-full h-full object-cover rounded-lg" />
                                                        <button
                                                            onClick={() => handleDownloadSingle(src, `${key}.png`)}
                                                            className="absolute bottom-2 right-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-1.5 rounded-full transition-opacity duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                            aria-label={`Download ${key} expression`}
                                                            title={`Download ${key} expression`}
                                                        >
                                                            <DownloadIcon />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <ImagePlaceholder label={expressionLabels[key]} />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 capitalize">{expressionLabels[key]}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'concept' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                        <div className="lg:col-span-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg flex flex-col space-y-4 md:space-y-6 h-fit">
                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">1. {t('concept.describeVision')}</h2>
                            <div>
                                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">{t('concept.prompt')}</label>
                                <textarea id="prompt" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500 transition"></textarea>
                            </div>
                            <div>
                                <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300 mb-2">{t('concept.aspectRatio')}</label>
                                <select id="aspectRatio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500 transition">
                                    <option value="1:1">{t('concept.ratios.square')}</option>
                                    <option value="3:4">{t('concept.ratios.portrait')}</option>
                                    <option value="4:3">{t('concept.ratios.landscape')}</option>
                                    <option value="9:16">{t('concept.ratios.tall')}</option>
                                    <option value="16:9">{t('concept.ratios.widescreen')}</option>
                                </select>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-300">
                                {t('generate.cost')} <span className="font-bold text-yellow-400">1 {t('generate.token')}</span>
                            </div>
                            <button onClick={handleGenerateConcept} disabled={isConceptLoading} className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-500 text-white font-bold py-2.5 md:py-3 px-4 rounded-lg transition-colors flex justify-center items-center text-sm md:text-base">
                                {isConceptLoading ? t('generate.generating') : t('generate.generateConcept')}
                            </button>
                            {conceptError && <p className="text-red-400 text-sm mt-2">{conceptError}</p>}
                        </div>

                        <div className="lg:col-span-2 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg flex flex-col justify-center items-center">
                            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 w-full">{t('results.generatedConcept')}</h2>
                            <div className="w-full h-full min-h-[400px] flex justify-center items-center relative group">
                                {isConceptLoading ? (
                                    <LoadingSpinner />
                                ) : conceptImage ? (
                                    <>
                                        <img src={conceptImage} alt="Generated concept art" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
                                        <button
                                            onClick={() => handleDownloadSingle(conceptImage, 'concept-art.png')}
                                            className="absolute bottom-4 right-4 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-opacity duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            aria-label="Download concept art"
                                            title="Download concept art"
                                        >
                                            <DownloadIcon />
                                        </button>
                                    </>
                                ) : (
                                    <ImagePlaceholder label={t('results.placeholder')} />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            <BuyTokensModal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} />
        </div>
    )
}
