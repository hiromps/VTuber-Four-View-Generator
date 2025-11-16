'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthModal from '@/components/AuthModal'
import TokenDisplay from '@/components/TokenDisplay'
import BuyTokensModal from '@/components/BuyTokensModal'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'
import type { User } from '@supabase/supabase-js'
import { UploadedFile } from '@/types'
import Link from 'next/link'

// SVG Icon Components
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
)

const LoadingSpinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
    </div>
)

const LayerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
    </svg>
)

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
)

interface Live2DPart {
    name: string
    description: string
    image: string | null
}

export default function Live2DPartsPage() {
    const { t } = useLanguage()
    const [user, setUser] = useState<User | null>(null)
    const [tokens, setTokens] = useState(0)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [showBuyModal, setShowBuyModal] = useState(false)

    // Upload and generation state
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [generatedParts, setGeneratedParts] = useState<Live2DPart[]>([])
    const [partsDescription, setPartsDescription] = useState<string>('')

    const supabase = createClient()

    // Check auth and load tokens
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const response = await fetch('/api/tokens')
                if (response.ok) {
                    const data = await response.json()
                    setTokens(data.tokens)
                }
            }
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    // Handle file upload
    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('画像ファイルをアップロードしてください')
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            const base64 = event.target?.result as string
            const objectURL = URL.createObjectURL(file)
            setUploadedFile({
                base64,
                mimeType: file.type,
                objectURL
            })
            setError(null)
            setGeneratedParts([])
        }
        reader.readAsDataURL(file)
    }, [])

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const file = e.dataTransfer.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('画像ファイルをアップロードしてください')
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            const base64 = event.target?.result as string
            const objectURL = URL.createObjectURL(file)
            setUploadedFile({
                base64,
                mimeType: file.type,
                objectURL
            })
            setError(null)
            setGeneratedParts([])
        }
        reader.readAsDataURL(file)
    }, [])

    // Generate Live2D parts design
    const handleGenerate = async () => {
        if (!uploadedFile) {
            setError('画像をアップロードしてください')
            return
        }

        if (!user) {
            setShowAuthModal(true)
            return
        }

        setIsGenerating(true)
        setError(null)

        try {
            const response = await fetch('/api/generate/live2d-parts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: uploadedFile.base64,
                    description: partsDescription
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 402) {
                    setShowBuyModal(true)
                    setError(data.error || 'トークンが不足しています')
                } else {
                    setError(data.error || '生成に失敗しました')
                }
                return
            }

            setGeneratedParts(data.parts)
            setTokens(data.tokensRemaining)
        } catch (err) {
            setError('エラーが発生しました')
            console.error(err)
        } finally {
            setIsGenerating(false)
        }
    }

    // Download individual part
    const handleDownloadPart = (part: Live2DPart) => {
        if (!part.image) return

        const link = document.createElement('a')
        link.href = part.image
        link.download = `${part.name}.png`
        link.click()
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 sticky top-0 z-50">
                <div className="container mx-auto">
                    <nav className="flex items-center justify-between">
                        <Link href="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            VTuber四面図AI
                        </Link>
                        <div className="flex items-center gap-4">
                            <LanguageSwitcher />
                            {user ? (
                                <>
                                    <TokenDisplay tokens={tokens} onClick={() => setShowBuyModal(true)} />
                                    <Link
                                        href="/app"
                                        className="text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-gray-700"
                                    >
                                        四面図生成
                                    </Link>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
                                >
                                    ログイン
                                </button>
                            )}
                        </div>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Page Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        Live2D パーツ分けデザイン
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        キャラクターイラストをアップロードして、Live2D制作に最適なパーツ分け案をAIが自動生成します。
                        各パーツのレイヤー構造を提案し、効率的なLive2Dモデル制作をサポートします。
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {/* Upload Section */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <LayerIcon />
                            キャラクター画像
                        </h2>

                        {/* Upload Area */}
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition cursor-pointer mb-4"
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                {uploadedFile ? (
                                    <div className="space-y-4">
                                        <img
                                            src={uploadedFile.objectURL}
                                            alt="Uploaded character"
                                            className="max-h-64 mx-auto rounded-lg"
                                        />
                                        <p className="text-gray-400 text-sm">クリックして画像を変更</p>
                                    </div>
                                ) : (
                                    <>
                                        <UploadIcon />
                                        <p className="mt-2 text-gray-400">
                                            クリックまたはドラッグ&ドロップで画像をアップロード
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            PNG, JPG, WebP (最大10MB)
                                        </p>
                                    </>
                                )}
                            </label>
                        </div>

                        {/* Additional Instructions */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                追加指示 (オプション)
                            </label>
                            <textarea
                                value={partsDescription}
                                onChange={(e) => setPartsDescription(e.target.value)}
                                placeholder="例: 髪の毛を前髪・後ろ髪・サイドに分けたい、目を細かくパーツ分けしたい など"
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white resize-none"
                                rows={4}
                            />
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedFile || isGenerating}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <LoadingSpinner />
                                    <span>パーツ分け案を生成中...</span>
                                </>
                            ) : (
                                <>
                                    <LayerIcon />
                                    <span>パーツ分け案を生成 (5トークン)</span>
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                                <p className="text-red-300">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-2xl font-bold mb-4">パーツ分け案</h2>

                        {generatedParts.length === 0 ? (
                            <div className="text-center py-12">
                                <LayerIcon />
                                <p className="text-gray-400 mt-4">
                                    画像をアップロードしてパーツ分け案を生成してください
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {generatedParts.map((part, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-purple-400">
                                                    {part.name}
                                                </h3>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {part.description}
                                                </p>
                                            </div>
                                            {part.image && (
                                                <button
                                                    onClick={() => handleDownloadPart(part)}
                                                    className="ml-4 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition"
                                                    title="ダウンロード"
                                                >
                                                    <DownloadIcon />
                                                </button>
                                            )}
                                        </div>
                                        {part.image && (
                                            <img
                                                src={part.image}
                                                alt={part.name}
                                                className="w-full rounded-lg mt-2"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-12 max-w-7xl mx-auto">
                    <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 border border-purple-700">
                        <h3 className="text-2xl font-bold mb-4">Live2Dパーツ分けとは？</h3>
                        <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                            <div>
                                <h4 className="font-semibold text-purple-400 mb-2">推奨されるパーツ構成</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>• 顔ベース（輪郭、肌）</li>
                                    <li>• 目（白目、瞳、ハイライト、まつげ）</li>
                                    <li>• 眉毛（左右別々）</li>
                                    <li>• 口（上唇、下唇、舌、歯）</li>
                                    <li>• 髪（前髪、後ろ髪、サイド、アホ毛）</li>
                                    <li>• 装飾品（アクセサリー、リボンなど）</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-purple-400 mb-2">パーツ分けのメリット</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>• 表情の変化がスムーズに</li>
                                    <li>• アニメーション制作が効率的</li>
                                    <li>• 細かい動きの調整が可能</li>
                                    <li>• Live2Dモデルの品質向上</li>
                                    <li>• 後からの修正が容易</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showAuthModal && (
                <AuthModal onClose={() => setShowAuthModal(false)} />
            )}
            {showBuyModal && (
                <BuyTokensModal onClose={() => setShowBuyModal(false)} />
            )}
        </div>
    )
}
