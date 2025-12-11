'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import JSZip from 'jszip'
import { fileToData } from '@/utils/imageUtils'
import { ViewType, GeneratedImages, AspectRatio, UploadedFile, ExpressionType, GeneratedExpressions } from '@/types'
import { createClient } from '@/lib/supabase/client'
import AuthModal from '@/components/AuthModal'
import TokenDisplay from '@/components/TokenDisplay'
import BuyTokensModal from '@/components/BuyTokensModal'
import HistoryModal from '@/components/HistoryModal'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'
import { composeGridImages, generateTwitterShareUrl } from '@/lib/imageComposer'
import type { User } from '@supabase/supabase-js'
import type { ModelType } from '@/types'
import { calculateTokenCost } from '@/lib/tokenCosts'
import './app.css'

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

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
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

const HamburgerIcon = ({ isOpen }: { isOpen: boolean }) => (
    <div className="w-6 h-5 flex flex-col justify-between cursor-pointer">
        <span className={`block h-0.5 w-full bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block h-0.5 w-full bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block h-0.5 w-full bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
    </div>
)

export default function Home() {
    const { t } = useLanguage()
    const [user, setUser] = useState<User | null>(null)
    const [tokens, setTokens] = useState(0)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [showBuyModal, setShowBuyModal] = useState(false)
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [activeTab, setActiveTab] = useState<'sheet' | 'concept' | 'expressions' | 'pose' | 'live2d'>('sheet')
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

    // Enhance Prompt State
    const [isEnhancingSheetPrompt, setIsEnhancingSheetPrompt] = useState(false)
    const [isEnhancingExpressionsPrompt, setIsEnhancingExpressionsPrompt] = useState(false)
    const [showSheetPromptMenu, setShowSheetPromptMenu] = useState(false)
    const [showExpressionsPromptMenu, setShowExpressionsPromptMenu] = useState(false)

    // Attached Item Image State
    const [sheetAttachedImage, setSheetAttachedImage] = useState<UploadedFile | null>(null)
    const [expressionsAttachedImage, setExpressionsAttachedImage] = useState<UploadedFile | null>(null)

    // Pose Generation State
    const [poseImage, setPoseImage] = useState<string | null>(null)
    const [isPoseLoading, setIsPoseLoading] = useState(false)
    const [poseError, setPoseError] = useState<string | null>(null)
    const [poseDescription, setPoseDescription] = useState<string>('')
    const [poseReferenceImage, setPoseReferenceImage] = useState<UploadedFile | null>(null)
    const [poseAdditionalPrompt, setPoseAdditionalPrompt] = useState<string>('')
    const [isEnhancingPosePrompt, setIsEnhancingPosePrompt] = useState(false)

    // Live2D Parts State
    const [live2dUploadedFile, setLive2dUploadedFile] = useState<UploadedFile | null>(null)
    const [live2dParts, setLive2dParts] = useState<any[]>([])
    const [isLive2dLoading, setIsLive2dLoading] = useState(false)
    const [live2dError, setLive2dError] = useState<string | null>(null)
    const [live2dDescription, setLive2dDescription] = useState<string>('')
    const [showLive2dPromptMenu, setShowLive2dPromptMenu] = useState(false)
    const [isEnhancingLive2dPrompt, setIsEnhancingLive2dPrompt] = useState(false)
    const [live2dAttachedImage, setLive2dAttachedImage] = useState<UploadedFile | null>(null)
    const [showPosePromptMenu, setShowPosePromptMenu] = useState(false)
    const [poseAttachedImage, setPoseAttachedImage] = useState<UploadedFile | null>(null)
    const [isEnhancingAdditionalPrompt, setIsEnhancingAdditionalPrompt] = useState(false)
    const [showAdditionalPromptMenu, setShowAdditionalPromptMenu] = useState(false)

    // Drag and Drop State
    const [isDraggingMain, setIsDraggingMain] = useState(false)
    const [isDraggingPoseRef, setIsDraggingPoseRef] = useState(false)

    // Model Selection State
    const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-2.5-flash-image')

    // Mobile Menu State
    const [showMobileMenu, setShowMobileMenu] = useState(false)

    const expressionLabels: { [key in ExpressionType]: string } = {
        joy: t('expressions.joy'),
        anger: t('expressions.anger'),
        sorrow: t('expressions.sorrow'),
        surprise: t('expressions.surprise'),
    }

    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        if (!supabase) {
            setAuthError('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
        }
    }, [supabase])

    // Close prompt menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('.prompt-menu-container')) {
                setShowSheetPromptMenu(false)
                setShowExpressionsPromptMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close mobile menu on Escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showMobileMenu) {
                setShowMobileMenu(false)
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [showMobileMenu])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (showMobileMenu) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [showMobileMenu])

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
        if (!supabase) {
            return
        }

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
    }, [supabase])

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

    // Main character image drag and drop handlers
    const handleMainDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingMain(true)
    }

    const handleMainDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingMain(false)
    }

    const handleMainDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingMain(false)

        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            try {
                const data = await fileToData(file)
                setUploadedFile(data)
                setGeneratedImages({ front: null, back: null, left: null, right: null })
                setSheetError(null)
                setExpressionsImages({ joy: null, anger: null, sorrow: null, surprise: null })
                setExpressionsError(null)
                setPoseImage(null)
                setPoseError(null)
            } catch (error) {
                console.error("Error processing dropped file:", error)
                const errorMessage = t('errors.uploadImage')
                setSheetError(errorMessage)
                setExpressionsError(errorMessage)
                setPoseError(errorMessage)
            }
        }
    }

    // Pose reference image drag and drop handlers
    const handlePoseRefDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingPoseRef(true)
    }

    const handlePoseRefDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingPoseRef(false)
    }

    const handlePoseRefDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingPoseRef(false)

        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            try {
                const data = await fileToData(file)
                setPoseReferenceImage(data)
            } catch (error) {
                console.error("Error processing dropped reference file:", error)
                setPoseError(error instanceof Error ? error.message : "Failed to process reference image")
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

        const requiredTokens = calculateTokenCost('CHARACTER_SHEET', selectedModel)
        if (tokens < requiredTokens) {
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
                    attachedImageBase64: sheetAttachedImage?.base64,
                    attachedImageMimeType: sheetAttachedImage?.mimeType,
                    model: selectedModel,
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
    }, [user, uploadedFile, tokens, sheetAdditionalPrompt, sheetAttachedImage, selectedModel])

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

        const requiredTokens = calculateTokenCost('FACIAL_EXPRESSIONS', selectedModel)
        if (tokens < requiredTokens) {
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
                    attachedImageBase64: expressionsAttachedImage?.base64,
                    attachedImageMimeType: expressionsAttachedImage?.mimeType,
                    model: selectedModel,
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
    }, [user, uploadedFile, tokens, expressionsAdditionalPrompt, expressionsAttachedImage, selectedModel])

    const handleGeneratePose = useCallback(async () => {
        if (!user) {
            setShowAuthModal(true)
            return
        }

        if (!uploadedFile) {
            setPoseError(t('errors.uploadImage'))
            return
        }

        // ポーズの説明または参考画像のどちらかが必要
        if (!poseDescription && !poseReferenceImage) {
            setPoseError('ポーズの説明または参考画像を入力してください')
            return
        }

        const requiredTokens = calculateTokenCost('POSE_GENERATION', selectedModel)
        if (tokens < requiredTokens) {
            setPoseError(t('errors.insufficientTokens'))
            setShowBuyModal(true)
            return
        }

        setIsPoseLoading(true)
        setPoseError(null)
        setPoseImage(null)

        try {
            const response = await fetch('/api/generate/pose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    base64Image: uploadedFile.base64,
                    mimeType: uploadedFile.mimeType,
                    poseDescription: poseDescription,
                    referenceImageBase64: poseReferenceImage?.base64,
                    referenceImageMimeType: poseReferenceImage?.mimeType,
                    additionalPrompt: poseAdditionalPrompt,
                    attachedImageBase64: poseAttachedImage?.base64,
                    model: selectedModel,
                    attachedImageMimeType: poseAttachedImage?.mimeType,
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
                throw new Error(data.error || 'Failed to generate pose')
            }

            setTokens(data.tokens)
            setPoseImage(data.image)

        } catch (error) {
            console.error("Error generating pose:", error)
            if (error instanceof Error && error.message.includes('JSON')) {
                setPoseError('画像サイズが大きすぎる可能性があります。より小さい画像をお試しください。')
            } else {
                setPoseError(error instanceof Error ? error.message : "An unknown error occurred.")
            }
        } finally {
            setIsPoseLoading(false)
        }
    }, [user, uploadedFile, tokens, poseDescription, poseReferenceImage, poseAdditionalPrompt, poseAttachedImage, t, selectedModel])

    const handleEnhanceLive2dPrompt = useCallback(async () => {
        if (!live2dDescription || live2dDescription.trim() === '') {
            return
        }

        setShowLive2dPromptMenu(false)
        setIsEnhancingLive2dPrompt(true)
        try {
            const response = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: live2dDescription }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to enhance prompt')
            }

            setLive2dDescription(data.enhancedPrompt)
        } catch (error) {
            console.error("Error enhancing prompt:", error)
            setLive2dError(error instanceof Error ? error.message : "Failed to enhance prompt")
        } finally {
            setIsEnhancingLive2dPrompt(false)
        }
    }, [live2dDescription])

    const handleLive2dAttachFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            try {
                const data = await fileToData(file)
                setLive2dAttachedImage(data)
                setShowLive2dPromptMenu(false)
            } catch (error) {
                console.error("Error processing attached file:", error)
                setLive2dError(error instanceof Error ? error.message : "Failed to process attached file")
            }
        }
    }, [])

    const handleGenerateLive2D = useCallback(async () => {
        if (!user) {
            setShowAuthModal(true)
            return
        }

        if (!live2dUploadedFile) {
            setLive2dError('画像をアップロードしてください')
            return
        }

        const requiredTokens = calculateTokenCost('LIVE2D_PARTS', selectedModel)
        if (tokens < requiredTokens) {
            setLive2dError(`トークンが不足しています（必要: ${requiredTokens}トークン）`)
            setShowBuyModal(true)
            return
        }

        setIsLive2dLoading(true)
        setLive2dError(null)
        setLive2dParts([])

        try {
            const response = await fetch('/api/generate/live2d-parts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: live2dUploadedFile.base64,
                    description: live2dDescription,
                    model: selectedModel,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 402) {
                    setShowBuyModal(true)
                    setLive2dError(data.error || 'トークンが不足しています')
                } else {
                    setLive2dError(data.error || '生成に失敗しました')
                }
                return
            }

            setLive2dParts(data.parts)
            setTokens(data.tokensRemaining)

        } catch (error) {
            console.error("Error generating Live2D parts:", error)
            setLive2dError(error instanceof Error ? error.message : "エラーが発生しました")
        } finally {
            setIsLive2dLoading(false)
        }
    }, [user, live2dUploadedFile, tokens, live2dDescription, selectedModel])

    const handleLive2dFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            try {
                const data = await fileToData(file)
                setLive2dUploadedFile(data)
                setLive2dError(null)
            } catch (error) {
                console.error("Error processing file:", error)
                setLive2dError(error instanceof Error ? error.message : "Failed to process image")
            }
        }
    }, [])

    const handlePoseReferenceImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            try {
                const data = await fileToData(file)
                setPoseReferenceImage(data)
            } catch (error) {
                console.error("Error processing reference image:", error)
                setPoseError(error instanceof Error ? error.message : "Failed to process reference image")
            }
        }
    }, [])

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

    // Xシェア機能 - 四面図
    const handleShareToX = useCallback(async () => {
        try {
            // ラベルを取得
            const labels = {
                front: t('views.front'),
                back: t('views.back'),
                left: t('views.left'),
                right: t('views.right'),
            }

            // 4枚の画像を合成
            const composedImage = await composeGridImages(generatedImages, labels)

            // 合成画像をダウンロード
            const link = document.createElement('a')
            link.href = composedImage
            link.download = 'vtuber-four-view.png'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // ダウンロード完了を待ってからXに遷移
            await new Promise(resolve => setTimeout(resolve, 500))

            // Xシェア用URLを開く
            const shareText = `VTuberの四面図を生成しました！\n\n#四面図AI #VTuber #AIart`
            const appUrl = window.location.origin
            const twitterUrl = generateTwitterShareUrl(shareText, appUrl)
            window.open(twitterUrl, '_blank', 'noopener,noreferrer')
        } catch (error) {
            console.error('Error sharing to X:', error)
            setSheetError('シェア用画像の生成に失敗しました')
        }
    }, [generatedImages, t])

    // Xシェア機能 - 表情差分
    const handleShareExpressionsToX = useCallback(async () => {
        try {
            // ラベルを取得
            const labels = {
                joy: t('expressions.joy'),
                anger: t('expressions.anger'),
                sorrow: t('expressions.sorrow'),
                surprise: t('expressions.surprise'),
            }

            // 4枚の画像を合成
            const composedImage = await composeGridImages(expressionsImages, labels)

            // 合成画像をダウンロード
            const link = document.createElement('a')
            link.href = composedImage
            link.download = 'vtuber-expressions.png'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // ダウンロード完了を待ってからXに遷移
            await new Promise(resolve => setTimeout(resolve, 500))

            // Xシェア用URLを開く
            const shareText = `VTuberの表情差分を生成しました！\n\n#四面図AI #VTuber #AIart`
            const appUrl = window.location.origin
            const twitterUrl = generateTwitterShareUrl(shareText, appUrl)
            window.open(twitterUrl, '_blank', 'noopener,noreferrer')
        } catch (error) {
            console.error('Error sharing to X:', error)
            setExpressionsError('シェア用画像の生成に失敗しました')
        }
    }, [expressionsImages, t])

    const handleEnhanceSheetPrompt = useCallback(async () => {
        if (!sheetAdditionalPrompt || sheetAdditionalPrompt.trim() === '') {
            return
        }

        setShowSheetPromptMenu(false)
        setIsEnhancingSheetPrompt(true)
        try {
            const response = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: sheetAdditionalPrompt }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to enhance prompt')
            }

            setSheetAdditionalPrompt(data.enhancedPrompt)
        } catch (error) {
            console.error("Error enhancing prompt:", error)
            setSheetError(error instanceof Error ? error.message : "Failed to enhance prompt")
        } finally {
            setIsEnhancingSheetPrompt(false)
        }
    }, [sheetAdditionalPrompt])

    const handleEnhanceExpressionsPrompt = useCallback(async () => {
        if (!expressionsAdditionalPrompt || expressionsAdditionalPrompt.trim() === '') {
            return
        }

        setShowExpressionsPromptMenu(false)
        setIsEnhancingExpressionsPrompt(true)
        try {
            const response = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: expressionsAdditionalPrompt }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to enhance prompt')
            }

            setExpressionsAdditionalPrompt(data.enhancedPrompt)
        } catch (error) {
            console.error("Error enhancing prompt:", error)
            setExpressionsError(error instanceof Error ? error.message : "Failed to enhance prompt")
        } finally {
            setIsEnhancingExpressionsPrompt(false)
        }
    }, [expressionsAdditionalPrompt])

    const handleSheetAttachFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            try {
                const data = await fileToData(file)
                setSheetAttachedImage(data)
                setShowSheetPromptMenu(false)
            } catch (error) {
                console.error("Error processing attached file:", error)
                setSheetError(error instanceof Error ? error.message : "Failed to process attached file")
            }
        }
    }, [])

    const handleExpressionsAttachFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            try {
                const data = await fileToData(file)
                setExpressionsAttachedImage(data)
                setShowExpressionsPromptMenu(false)
            } catch (error) {
                console.error("Error processing attached file:", error)
                setExpressionsError(error instanceof Error ? error.message : "Failed to process attached file")
            }
        }
    }, [])

    const handleEnhancePosePrompt = useCallback(async () => {
        if (!poseDescription || poseDescription.trim() === '') {
            return
        }

        setShowPosePromptMenu(false)
        setIsEnhancingPosePrompt(true)
        try {
            const response = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: poseDescription }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to enhance prompt')
            }

            setPoseDescription(data.enhancedPrompt)
        } catch (error) {
            console.error("Error enhancing prompt:", error)
            setPoseError(error instanceof Error ? error.message : "Failed to enhance prompt")
        } finally {
            setIsEnhancingPosePrompt(false)
        }
    }, [poseDescription])

    const handleEnhanceAdditionalPrompt = useCallback(async () => {
        if (!poseAdditionalPrompt || poseAdditionalPrompt.trim() === '') {
            return
        }

        setShowAdditionalPromptMenu(false)
        setIsEnhancingAdditionalPrompt(true)
        try {
            const response = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: poseAdditionalPrompt }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to enhance prompt')
            }

            setPoseAdditionalPrompt(data.enhancedPrompt)
        } catch (error) {
            console.error("Error enhancing additional prompt:", error)
            setPoseError(error instanceof Error ? error.message : "Failed to enhance prompt")
        } finally {
            setIsEnhancingAdditionalPrompt(false)
        }
    }, [poseAdditionalPrompt])

    const handlePoseAttachFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            try {
                const data = await fileToData(file)
                setPoseAttachedImage(data)
                setShowPosePromptMenu(false)
            } catch (error) {
                console.error("Error processing attached file:", error)
                setPoseError(error instanceof Error ? error.message : "Failed to process attached file")
            }
        }
    }, [])

    const hasAnyGeneratedImages = Object.values(generatedImages).some(img => img !== null)
    const hasAnyGeneratedExpressionImages = Object.values(expressionsImages).some(img => img !== null)

    const TabButton: React.FC<{ tabId: 'sheet' | 'concept' | 'expressions' | 'pose' | 'live2d'; children: React.ReactNode }> = ({ tabId, children }) => (
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
        <div className="app-container">
            {/* 背景エフェクト */}
            <div className="app-bg-effects">
                <div className="app-gradient-orb app-gradient-orb-1"></div>
                <div className="app-gradient-orb app-gradient-orb-2"></div>
            </div>

            <header className="app-header">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="app-logo-text text-base sm:text-lg md:text-xl lg:text-2xl">
                        {t('app.title')}
                    </h1>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-3">
                        <LanguageSwitcher />
                        {user ? (
                            <>
                                {/* Model Selection Toggle */}
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
                                    <span className="text-xs text-gray-400">モデル:</span>
                                    <button
                                        onClick={() => setSelectedModel(selectedModel === 'gemini-2.5-flash-image' ? 'nanobanana-pro' : 'gemini-2.5-flash-image')}
                                        className={`relative inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                                            selectedModel === 'nanobanana-pro'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                        title={selectedModel === 'nanobanana-pro' ? 'nanobanana pro (トークン消費1.5倍)' : 'Gemini 2.5 Flash (標準)'}
                                    >
                                        {selectedModel === 'nanobanana-pro' ? 'Pro' : '標準'}
                                        {selectedModel === 'nanobanana-pro' && (
                                            <span className="ml-1 text-[10px] opacity-75">×1.5</span>
                                        )}
                                    </button>
                                </div>
                                <TokenDisplay tokens={tokens} onBuyTokens={() => setShowBuyModal(true)} />
                                <button
                                    onClick={() => setShowHistoryModal(true)}
                                    className="text-sm text-gray-300 hover:text-white transition flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700/50"
                                    title="生成履歴"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>履歴</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-300 hover:text-white transition px-3 py-2 rounded hover:bg-gray-700/50"
                                >
                                    {t('app.logout')}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="app-btn-primary"
                            >
                                {t('app.signIn')}
                            </button>
                        )}
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex md:hidden items-center gap-2">
                        <LanguageSwitcher />
                        {user ? (
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="p-2 text-gray-300 hover:text-white transition"
                                aria-label="メニュー"
                            >
                                <HamburgerIcon isOpen={showMobileMenu} />
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1.5 px-4 rounded-lg transition text-sm"
                            >
                                {t('app.signIn')}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            {user && (
                <>
                    {/* Overlay */}
                    <div
                        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${
                            showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        onClick={() => setShowMobileMenu(false)}
                    />

                    {/* Drawer */}
                    <div
                        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gray-800 shadow-2xl z-40 md:hidden transform transition-transform duration-300 ease-in-out ${
                            showMobileMenu ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    >
                        <div className="flex flex-col h-full">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                                <h2 className="text-lg font-semibold text-white">メニュー</h2>
                                <button
                                    onClick={() => setShowMobileMenu(false)}
                                    className="p-2 text-gray-400 hover:text-white transition"
                                    aria-label="閉じる"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Model Selection */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-3">モデル選択</label>
                                    <button
                                        onClick={() => setSelectedModel(selectedModel === 'gemini-2.5-flash-image' ? 'nanobanana-pro' : 'gemini-2.5-flash-image')}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                                            selectedModel === 'nanobanana-pro'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                                        }`}
                                    >
                                        <span className="font-medium">
                                            {selectedModel === 'nanobanana-pro' ? 'nanobanana Pro' : 'Gemini 2.5 Flash (標準)'}
                                        </span>
                                        {selectedModel === 'nanobanana-pro' && (
                                            <span className="text-sm bg-purple-700 px-2 py-1 rounded">×1.5</span>
                                        )}
                                    </button>
                                    <p className="mt-2 text-xs text-gray-400">
                                        {selectedModel === 'nanobanana-pro'
                                            ? 'トークン消費量: 1.5倍'
                                            : 'トークン消費量: 標準'}
                                    </p>
                                </div>

                                {/* Token Display */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-300">トークン残高</span>
                                        <span className="text-xl font-bold text-purple-400">{tokens}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowMobileMenu(false)
                                            setShowBuyModal(true)
                                        }}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition"
                                    >
                                        トークンを購入
                                    </button>
                                </div>

                                {/* Menu Items */}
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            setShowMobileMenu(false)
                                            setShowHistoryModal(true)
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">生成履歴</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowMobileMenu(false)
                                            handleLogout()
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-700/50 rounded-lg transition"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span className="font-medium">{t('app.logout')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

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
                    <TabButton tabId="pose">{t('tabs.poseGeneration')}</TabButton>
                    <TabButton tabId="live2d">{t('tabs.live2dParts')}</TabButton>
                    <TabButton tabId="concept">{t('tabs.conceptArt')}</TabButton>
                </div>

                {activeTab === 'sheet' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                        {/* Controls */}
                        <div className="lg:col-span-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg flex flex-col space-y-4 md:space-y-6 h-fit">
                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">1. {t('upload.title')}</h2>
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="dropzone-file"
                                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                        isDraggingMain
                                            ? 'border-purple-500 bg-purple-900/30'
                                            : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                                    }`}
                                    onDragOver={handleMainDragOver}
                                    onDragLeave={handleMainDragLeave}
                                    onDrop={handleMainDrop}
                                >
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
                                <div className="relative">
                                    <textarea
                                        id="sheet-additional-prompt"
                                        rows={3}
                                        value={sheetAdditionalPrompt}
                                        onChange={(e) => setSheetAdditionalPrompt(e.target.value)}
                                        placeholder={t('customize.placeholder')}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition"
                                    />
                                    <div className="absolute bottom-2 left-2 prompt-menu-container">
                                        <button
                                            onClick={() => setShowSheetPromptMenu(!showSheetPromptMenu)}
                                            disabled={isEnhancingSheetPrompt}
                                            className={`${
                                                sheetAdditionalPrompt && sheetAdditionalPrompt.trim() !== ''
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                                    : 'bg-gray-600 hover:bg-gray-500'
                                            } disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-1.5 rounded-full transition-all duration-200 flex items-center justify-center`}
                                            title="プロンプトツール"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                        {showSheetPromptMenu && (
                                            <div className="absolute bottom-full left-0 mb-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg overflow-hidden z-10 min-w-[200px]">
                                                <button
                                                    onClick={handleEnhanceSheetPrompt}
                                                    disabled={!sheetAdditionalPrompt || sheetAdditionalPrompt.trim() === '' || isEnhancingSheetPrompt}
                                                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                                >
                                                    {isEnhancingSheetPrompt ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            <span>最適化中...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                            <span>{t('customize.enhancePrompt')}</span>
                                                        </>
                                                    )}
                                                </button>
                                                <label className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                    <span>{t('customize.attachFile')}</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/png, image/jpeg, image/webp"
                                                        onChange={handleSheetAttachFile}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    {t('customize.hint')}
                                </p>
                                {sheetAttachedImage?.objectURL && (
                                    <div className="mt-3 relative">
                                        <p className="text-xs font-medium text-gray-300 mb-1.5">添付画像:</p>
                                        <div className="relative inline-block">
                                            <img
                                                src={sheetAttachedImage.objectURL}
                                                alt="Attached item"
                                                className="rounded-lg max-h-24 object-contain border border-gray-600"
                                            />
                                            <button
                                                onClick={() => setSheetAttachedImage(null)}
                                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                                title="削除"
                                            >
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">3. {t('generate.sheetTitle')}</h2>
                            <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-300">
                                {t('generate.cost')} <span className="font-bold text-yellow-400">{calculateTokenCost('CHARACTER_SHEET', selectedModel)} {t('generate.tokens')}</span>
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
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={handleDownloadAll}
                                            disabled={isZipping || isSheetLoading}
                                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-3 md:px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-xs md:text-sm gap-1.5 md:gap-2"
                                        >
                                            <DownloadIcon />
                                            <span>{isZipping ? t('results.zipping') : t('results.downloadAll')}</span>
                                        </button>
                                        <button
                                            onClick={handleShareToX}
                                            disabled={isSheetLoading}
                                            className="bg-black hover:bg-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-3 md:px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-xs md:text-sm gap-1.5 md:gap-2"
                                        >
                                            <XIcon />
                                            <span>{t('results.shareToX')}</span>
                                        </button>
                                    </div>
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
                                <label
                                    htmlFor="dropzone-file-expressions"
                                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                        isDraggingMain
                                            ? 'border-purple-500 bg-purple-900/30'
                                            : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                                    }`}
                                    onDragOver={handleMainDragOver}
                                    onDragLeave={handleMainDragLeave}
                                    onDrop={handleMainDrop}
                                >
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
                                <div className="relative">
                                    <textarea
                                        id="expressions-additional-prompt"
                                        rows={3}
                                        value={expressionsAdditionalPrompt}
                                        onChange={(e) => setExpressionsAdditionalPrompt(e.target.value)}
                                        placeholder={t('customize.placeholder')}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition"
                                    />
                                    <div className="absolute bottom-2 left-2 prompt-menu-container">
                                        <button
                                            onClick={() => setShowExpressionsPromptMenu(!showExpressionsPromptMenu)}
                                            disabled={isEnhancingExpressionsPrompt}
                                            className={`${
                                                expressionsAdditionalPrompt && expressionsAdditionalPrompt.trim() !== ''
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                                    : 'bg-gray-600 hover:bg-gray-500'
                                            } disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-1.5 rounded-full transition-all duration-200 flex items-center justify-center`}
                                            title="プロンプトツール"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                        {showExpressionsPromptMenu && (
                                            <div className="absolute bottom-full left-0 mb-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg overflow-hidden z-10 min-w-[200px]">
                                                <button
                                                    onClick={handleEnhanceExpressionsPrompt}
                                                    disabled={!expressionsAdditionalPrompt || expressionsAdditionalPrompt.trim() === '' || isEnhancingExpressionsPrompt}
                                                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                                >
                                                    {isEnhancingExpressionsPrompt ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            <span>最適化中...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                            <span>{t('customize.enhancePrompt')}</span>
                                                        </>
                                                    )}
                                                </button>
                                                <label className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                    <span>{t('customize.attachFile')}</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/png, image/jpeg, image/webp"
                                                        onChange={handleExpressionsAttachFile}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    {t('customize.hint')}
                                </p>
                                {expressionsAttachedImage?.objectURL && (
                                    <div className="mt-3 relative">
                                        <p className="text-xs font-medium text-gray-300 mb-1.5">添付画像:</p>
                                        <div className="relative inline-block">
                                            <img
                                                src={expressionsAttachedImage.objectURL}
                                                alt="Attached item"
                                                className="rounded-lg max-h-24 object-contain border border-gray-600"
                                            />
                                            <button
                                                onClick={() => setExpressionsAttachedImage(null)}
                                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                                title="削除"
                                            >
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">3. {t('generate.expressionsTitle')}</h2>
                            <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-300">
                                {t('generate.cost')} <span className="font-bold text-yellow-400">{calculateTokenCost('FACIAL_EXPRESSIONS', selectedModel)} {t('generate.tokens')}</span>
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
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={handleDownloadAllExpressions}
                                            disabled={isExpressionsZipping || isExpressionsLoading}
                                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-3 md:px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-xs md:text-sm gap-1.5 md:gap-2"
                                        >
                                            <DownloadIcon />
                                            <span>{isExpressionsZipping ? t('results.zipping') : t('results.downloadAll')}</span>
                                        </button>
                                        <button
                                            onClick={handleShareExpressionsToX}
                                            disabled={isExpressionsLoading}
                                            className="bg-black hover:bg-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-3 md:px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-xs md:text-sm gap-1.5 md:gap-2"
                                        >
                                            <XIcon />
                                            <span>{t('results.shareToX')}</span>
                                        </button>
                                    </div>
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

                {activeTab === 'pose' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                        {/* Controls */}
                        <div className="lg:col-span-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg flex flex-col space-y-4 md:space-y-6 h-fit">
                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">1. {t('upload.title')}</h2>
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="pose-dropzone-file"
                                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                        isDraggingMain
                                            ? 'border-purple-500 bg-purple-900/30'
                                            : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                                    }`}
                                    onDragOver={handleMainDragOver}
                                    onDragLeave={handleMainDragLeave}
                                    onDrop={handleMainDrop}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadIcon />
                                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">{t('upload.clickToUpload')}</span> {t('upload.dragAndDrop')}</p>
                                        <p className="text-xs text-gray-500">{t('upload.fileTypes')}</p>
                                    </div>
                                    <input id="pose-dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                                </label>
                            </div>

                            {uploadedFile?.objectURL && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-300 mb-2">{t('upload.preview')}</p>
                                    <img src={uploadedFile.objectURL} alt="Uploaded preview" className="rounded-lg w-full max-h-64 object-contain" />
                                </div>
                            )}

                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">2. {t('pose.specifyPose')}</h2>

                            {/* Pose Description with + button */}
                            <div>
                                <label htmlFor="pose-description" className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('pose.poseDescription')}
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="pose-description"
                                        rows={3}
                                        value={poseDescription}
                                        onChange={(e) => setPoseDescription(e.target.value)}
                                        placeholder={t('pose.descriptionPlaceholder')}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition"
                                    />
                                    <div className="absolute bottom-2 left-2 prompt-menu-container">
                                        <button
                                            onClick={() => setShowPosePromptMenu(!showPosePromptMenu)}
                                            className="p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                                            title={t('customize.enhancePrompt')}
                                        >
                                            <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {showPosePromptMenu && (
                                            <div className="absolute left-0 bottom-full mb-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg p-1 z-10">
                                                <button
                                                    onClick={handleEnhancePosePrompt}
                                                    disabled={isEnhancingPosePrompt || !poseDescription}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                    {isEnhancingPosePrompt ? '...' : t('customize.enhancePrompt')}
                                                </button>
                                                <label
                                                    htmlFor="pose-attach-file"
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-gray-600 rounded cursor-pointer whitespace-nowrap"
                                                >
                                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('customize.attachFile')}
                                                    <input
                                                        id="pose-attach-file"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/png, image/jpeg, image/webp"
                                                        onChange={handlePoseAttachFile}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {poseAttachedImage && (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                        </svg>
                                        <span>添付ファイル: {poseAttachedImage.objectURL.substring(0, 30)}...</span>
                                        <button
                                            onClick={() => setPoseAttachedImage(null)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Additional Prompt (optional) */}
                            <div>
                                <label htmlFor="pose-additional-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('customize.additionalInstructions')}
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="pose-additional-prompt"
                                        rows={2}
                                        value={poseAdditionalPrompt}
                                        onChange={(e) => setPoseAdditionalPrompt(e.target.value)}
                                        placeholder={t('customize.placeholder')}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition"
                                    />
                                    <div className="absolute bottom-2 left-2 prompt-menu-container">
                                        <button
                                            onClick={() => setShowAdditionalPromptMenu(!showAdditionalPromptMenu)}
                                            className="p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                                            title={t('customize.enhancePrompt')}
                                        >
                                            <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {showAdditionalPromptMenu && (
                                            <div className="absolute left-0 bottom-full mb-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg p-1 z-10">
                                                <button
                                                    onClick={handleEnhanceAdditionalPrompt}
                                                    disabled={isEnhancingAdditionalPrompt || !poseAdditionalPrompt}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                    {isEnhancingAdditionalPrompt ? '...' : t('customize.enhancePrompt')}
                                                </button>
                                                <label
                                                    htmlFor="additional-attach-file"
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-gray-600 rounded cursor-pointer whitespace-nowrap"
                                                >
                                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('customize.attachFile')}
                                                    <input
                                                        id="additional-attach-file"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/png, image/jpeg, image/webp"
                                                        onChange={handlePoseAttachFile}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{t('customize.hint')}</p>
                            </div>

                            {/* Reference Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('pose.referenceImage')}
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="pose-reference-image"
                                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                            isDraggingPoseRef
                                                ? 'border-purple-500 bg-purple-900/30'
                                                : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                                        }`}
                                        onDragOver={handlePoseRefDragOver}
                                        onDragLeave={handlePoseRefDragLeave}
                                        onDrop={handlePoseRefDrop}
                                    >
                                        {poseReferenceImage ? (
                                            <img src={poseReferenceImage.objectURL} alt="Reference" className="h-full rounded-lg object-contain" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-2">
                                                <UploadIcon />
                                                <p className="text-xs text-gray-400">{t('pose.uploadReference')}</p>
                                            </div>
                                        )}
                                        <input id="pose-reference-image" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handlePoseReferenceImageChange} />
                                    </label>
                                </div>
                                {poseReferenceImage && (
                                    <button
                                        onClick={() => setPoseReferenceImage(null)}
                                        className="mt-2 text-xs text-red-400 hover:text-red-300"
                                    >
                                        {t('pose.removeReference')}
                                    </button>
                                )}
                            </div>

                            <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-300">
                                {t('generate.cost')} <span className="font-bold text-yellow-400">{calculateTokenCost('POSE_GENERATION', selectedModel)} {t('generate.token')}</span>
                            </div>
                            <button
                                onClick={handleGeneratePose}
                                disabled={isPoseLoading || !uploadedFile || (!poseDescription && !poseReferenceImage)}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-500 text-white font-bold py-2.5 md:py-3 px-4 rounded-lg transition-colors flex justify-center items-center text-sm md:text-base"
                            >
                                {isPoseLoading ? t('generate.generating') : t('generate.generatePose')}
                            </button>
                            {poseError && <p className="text-red-400 text-sm mt-2">{poseError}</p>}
                        </div>

                        {/* Results */}
                        <div className="lg:col-span-2 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg flex flex-col">
                            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">{t('results.generatedPose')}</h2>
                            <div className="w-full h-full min-h-[500px] flex justify-center items-center relative group">
                                {isPoseLoading ? (
                                    <LoadingSpinner />
                                ) : poseImage ? (
                                    <>
                                        <img src={poseImage} alt="Generated pose" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
                                        <button
                                            onClick={() => handleDownloadSingle(poseImage, 'character-pose.png')}
                                            className="absolute bottom-4 right-4 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-opacity duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            aria-label="Download pose"
                                            title="Download pose"
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
                                {t('generate.cost')} <span className="font-bold text-yellow-400">{calculateTokenCost('CONCEPT_ART', selectedModel)} {t('generate.token')}</span>
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

                {activeTab === 'live2d' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                        {/* Controls */}
                        <div className="lg:col-span-1 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg flex flex-col space-y-4 md:space-y-6 h-fit">
                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">{t('live2d.uploadTitle')}</h2>
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="live2d-dropzone-file"
                                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors border-gray-600 bg-gray-700 hover:bg-gray-600"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadIcon />
                                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">{t('upload.clickToUpload')}</span> {t('upload.dragAndDrop')}</p>
                                        <p className="text-xs text-gray-500">PNG, JPEG, WebP</p>
                                    </div>
                                    <input id="live2d-dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleLive2dFileChange} />
                                </label>
                            </div>

                            {live2dUploadedFile?.objectURL && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-300 mb-2">{t('upload.preview')}</p>
                                    <img src={live2dUploadedFile.objectURL} alt="Uploaded preview" className="rounded-lg w-full max-h-64 object-contain" />
                                </div>
                            )}

                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">{t('live2d.customizeTitle')}</h2>
                            <div>
                                <label htmlFor="live2d-additional-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('live2d.additionalInstructions')}
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="live2d-additional-prompt"
                                        rows={3}
                                        value={live2dDescription}
                                        onChange={(e) => setLive2dDescription(e.target.value)}
                                        placeholder={t('live2d.placeholder')}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 transition"
                                    />
                                    <div className="absolute bottom-2 left-2 prompt-menu-container">
                                        <button
                                            onClick={() => setShowLive2dPromptMenu(!showLive2dPromptMenu)}
                                            disabled={isEnhancingLive2dPrompt}
                                            className={`${
                                                live2dDescription && live2dDescription.trim() !== ''
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                                    : 'bg-gray-600 hover:bg-gray-500'
                                            } disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-1.5 rounded-full transition-all duration-200 flex items-center justify-center`}
                                            title={t('live2d.promptTools')}
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                        {showLive2dPromptMenu && (
                                            <div className="absolute bottom-full left-0 mb-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg overflow-hidden z-10 min-w-[200px]">
                                                <button
                                                    onClick={handleEnhanceLive2dPrompt}
                                                    disabled={!live2dDescription || live2dDescription.trim() === '' || isEnhancingLive2dPrompt}
                                                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                                >
                                                    {isEnhancingLive2dPrompt ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            <span>{t('live2d.optimizing')}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                            <span>{t('live2d.enhancePrompt')}</span>
                                                        </>
                                                    )}
                                                </button>
                                                <label className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                    <span>{t('customize.attachFile')}</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/png, image/jpeg, image/webp"
                                                        onChange={handleLive2dAttachFile}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    {t('live2d.hint')}
                                </p>
                                {live2dAttachedImage?.objectURL && (
                                    <div className="mt-3 relative">
                                        <p className="text-xs font-medium text-gray-300 mb-1.5">{t('live2d.attachedImage')}</p>
                                        <div className="relative inline-block">
                                            <img
                                                src={live2dAttachedImage.objectURL}
                                                alt="Attached item"
                                                className="rounded-lg max-h-24 object-contain border border-gray-600"
                                            />
                                            <button
                                                onClick={() => setLive2dAttachedImage(null)}
                                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                                title="削除"
                                            >
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <h2 className="text-lg md:text-xl font-semibold border-b border-gray-600 pb-2 md:pb-3">{t('live2d.generateTitle')}</h2>
                            <div className="bg-gray-700 p-3 rounded-lg text-sm text-gray-300">
                                {t('live2d.tokenConsumption')} <span className="font-bold text-yellow-400">{calculateTokenCost('LIVE2D_PARTS', selectedModel)} {t('generate.tokens')}</span>
                            </div>
                            <button
                                onClick={handleGenerateLive2D}
                                disabled={!live2dUploadedFile || isLive2dLoading}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2.5 md:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-sm md:text-base"
                            >
                                {isLive2dLoading ? t('live2d.generating') : t('live2d.generateButton')}
                            </button>
                            {live2dError && <p className="text-red-400 text-sm mt-2">{live2dError}</p>}
                        </div>

                        {/* Results */}
                        <div className="lg:col-span-2 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
                            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">{t('live2d.resultsTitle')}</h2>

                            {isLive2dLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <LoadingSpinner />
                                </div>
                            ) : live2dParts.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">{t('live2d.uploadPrompt')}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[800px] overflow-y-auto">
                                    {live2dParts.map((part, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-base text-purple-400">
                                                    {part.name}
                                                </h3>
                                                {part.image && (
                                                    <button
                                                        onClick={() => handleDownloadSingle(part.image, part.filename || `${part.name}.png`)}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white p-1.5 rounded transition"
                                                        title="ダウンロード"
                                                    >
                                                        <DownloadIcon />
                                                    </button>
                                                )}
                                            </div>
                                            {part.image && (
                                                <div className="bg-gray-800 rounded-lg p-2 mb-2">
                                                    <img
                                                        src={part.image}
                                                        alt={part.name}
                                                        className="w-full h-auto rounded"
                                                    />
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-400">
                                                {part.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            <BuyTokensModal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} />
            <HistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} />
        </div>
    )
}
