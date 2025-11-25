'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import CollectionFilters from './CollectionFilters'
import CollectionGrid from './CollectionGrid'
import { useLanguage } from '@/contexts/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import { composeGridImages, generateTwitterShareUrl } from '@/lib/imageComposer'
import {
  ImageHistoryItem,
  FilterState,
  SortOrder,
  PaginationState,
  DEFAULT_FILTER_STATE,
  DEFAULT_PAGINATION_STATE,
  GENERATION_TYPE_LABELS,
  Live2DPart,
} from '@/types/collection'

export default function CollectionView() {
  const router = useRouter()
  const { language, t } = useLanguage()

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Collection state
  const [history, setHistory] = useState<ImageHistoryItem[]>([])
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE)
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION_STATE)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ImageHistoryItem | null>(null)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true)
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsAuthenticated(false)
          // Redirect to app page with auth modal
          router.push('/app?auth=login')
        } else {
          setIsAuthenticated(true)
        }
      } catch {
        setIsAuthenticated(false)
        router.push('/app?auth=login')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        router.push('/app?auth=login')
      } else if (session) {
        setIsAuthenticated(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Fetch collection data
  const fetchCollection = useCallback(
    async (reset = false) => {
      if (!isAuthenticated) return

      if (reset) {
        setInitialLoading(true)
      } else {
        setLoading(true)
      }

      try {
        const params = new URLSearchParams({
          limit: pagination.itemsPerPage.toString(),
          offset: reset ? '0' : (pagination.currentPage * pagination.itemsPerPage).toString(),
        })

        if (filters.generationType !== 'all') {
          params.set('type', filters.generationType)
        }

        if (filters.searchKeyword) {
          params.set('search', filters.searchKeyword)
        }

        params.set('sort', sortOrder)

        const response = await fetch(`/api/history?${params}`)

        if (!response.ok) {
          if (response.status === 401) {
            setIsAuthenticated(false)
            router.push('/app?auth=login')
            return
          }
          throw new Error('Failed to fetch collection')
        }

        const data = await response.json()

        setHistory(reset ? data.history : [...history, ...data.history])
        setPagination({
          ...pagination,
          totalItems: data.total || data.history.length,
          hasMore: data.hasMore !== undefined ? data.hasMore : data.history.length >= pagination.itemsPerPage,
          currentPage: reset ? 1 : pagination.currentPage + 1,
        })
      } catch (error) {
        console.error('Failed to fetch collection:', error)
      } finally {
        setLoading(false)
        setInitialLoading(false)
      }
    },
    [isAuthenticated, filters, sortOrder, pagination, history, router]
  )

  // Initial fetch and refetch on filter/sort changes
  useEffect(() => {
    if (isAuthenticated) {
      // Reset pagination and fetch
      setPagination(DEFAULT_PAGINATION_STATE)
      fetchCollection(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, filters, sortOrder])

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchCollection(false)
    }
  }, [loading, pagination.hasMore, fetchCollection])

  // Filter handlers
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

  const handleSortChange = useCallback((newSort: SortOrder) => {
    setSortOrder(newSort)
  }, [])

  // Delete handler
  const handleDelete = useCallback(
    async (id: string) => {
      const confirmMessage =
        language === 'ja' ? 'この履歴を削除してもよろしいですか？' : 'Are you sure you want to delete this item?'

      if (!confirm(confirmMessage)) return

      try {
        const response = await fetch(`/api/history/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setHistory((prev) => prev.filter((item) => item.id !== id))
          setPagination((prev) => ({
            ...prev,
            totalItems: prev.totalItems - 1,
          }))
          if (selectedItem?.id === id) {
            setSelectedItem(null)
          }
        }
      } catch (error) {
        console.error('Failed to delete item:', error)
      }
    },
    [language, selectedItem]
  )

  // Share to X handler
  const handleShareToX = useCallback(async (item: ImageHistoryItem) => {
    try {
      let imageToShare: string
      let filename: string
      let shareText: string

      if (typeof item.images === 'string') {
        // Concept art or pose generation (single image)
        imageToShare = item.images
        filename =
          item.generation_type === 'pose_generation' ? 'vtuber-pose.png' : 'vtuber-concept-art.png'
        shareText =
          item.generation_type === 'pose_generation'
            ? `VTuberのポーズを生成しました！\n\n#四面図AI #VTuber #AIart`
            : `VTuberのコンセプトアートを生成しました！\n\n#四面図AI #VTuber #AIart`
      } else if (item.generation_type === 'live2d_parts' && (item.images as { parts?: Live2DPart[] }).parts) {
        // Live2D parts (share first image only)
        const parts = (item.images as { parts: Live2DPart[] }).parts
        if (!parts[0] || !parts[0].image) {
          alert('シェア可能な画像がありません')
          return
        }
        imageToShare = parts[0].image
        filename = 'vtuber-live2d-parts.png'
        shareText = `VTuberのLive2Dパーツを生成しました！\n\n#四面図AI #VTuber #AIart #Live2D`
      } else {
        // Character sheet or facial expressions (4 images)
        const labels: Record<string, string> =
          item.generation_type === 'character_sheet'
            ? { front: '正面', back: '背面', left: '左側', right: '右側' }
            : { joy: '喜', anger: '怒', sorrow: '哀', surprise: '驚' }

        imageToShare = await composeGridImages(item.images as Record<string, string>, labels)
        filename =
          item.generation_type === 'character_sheet'
            ? 'vtuber-four-view.png'
            : 'vtuber-expressions.png'
        shareText =
          item.generation_type === 'character_sheet'
            ? `VTuberの四面図を生成しました！\n\n#四面図AI #VTuber #AIart`
            : `VTuberの表情差分を生成しました！\n\n#四面図AI #VTuber #AIart`
      }

      // Download image
      const link = document.createElement('a')
      link.href = imageToShare
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Wait for download then open X
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Open X share screen
      const appUrl = window.location.origin
      const twitterUrl = generateTwitterShareUrl(shareText, appUrl)
      window.open(twitterUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error sharing to X:', error)
      alert('シェア用画像の生成に失敗しました')
    }
  }, [])

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get generation type label
  const getGenerationTypeLabel = (type: string) => {
    const labels = GENERATION_TYPE_LABELS[type as keyof typeof GENERATION_TYPE_LABELS]
    return labels ? labels[language] : type
  }

  // Render detail modal for selected item
  const renderDetailModal = () => {
    if (!selectedItem) return null

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-start sm:items-center justify-center z-50 p-0 sm:p-4 pt-2 sm:pt-4"
        onClick={() => setSelectedItem(null)}
      >
        <div
          className="bg-gray-800 rounded-lg w-full max-w-5xl max-h-[80vh] sm:max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Detail Header */}
          <div className="flex justify-between items-start p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
            <div className="flex flex-col gap-2 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {getGenerationTypeLabel(selectedItem.generation_type)}
              </h3>
              <button
                onClick={() => handleShareToX(selectedItem)}
                className="bg-black hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>{language === 'ja' ? 'Xでシェア' : 'Share to X'}</span>
              </button>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-gray-400 hover:text-white transition p-1 flex-shrink-0 ml-4"
              aria-label={language === 'ja' ? '閉じる' : 'Close'}
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Detail Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
            {selectedItem.prompt && (
              <div className="mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                  {language === 'ja' ? 'プロンプト:' : 'Prompt:'}
                </p>
                <p className="text-sm sm:text-base text-white break-words">{selectedItem.prompt}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {typeof selectedItem.images === 'string' ? (
                <div className="sm:col-span-2">
                  <img
                    src={selectedItem.images}
                    alt="Generated"
                    className="w-full rounded-lg max-h-[60vh] object-contain mx-auto"
                  />
                </div>
              ) : selectedItem.generation_type === 'live2d_parts' &&
                (selectedItem.images as { parts?: Live2DPart[] }).parts ? (
                (selectedItem.images as { parts: Live2DPart[] }).parts.map((part, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={part.image}
                      alt={part.name}
                      className="w-full rounded-lg object-contain max-h-[50vh]"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-xs sm:text-sm text-white font-semibold bg-purple-600/90 backdrop-blur-sm px-3 py-1.5 rounded shadow-lg">
                        {part.name}
                      </span>
                    </div>
                    {part.description && (
                      <div className="mt-2 text-xs text-gray-400">{part.description}</div>
                    )}
                  </div>
                ))
              ) : (
                Object.entries(selectedItem.images).map(([key, url]) => (
                  <div key={key} className="relative">
                    <img
                      src={url as string}
                      alt={key}
                      className="w-full rounded-lg object-contain max-h-[50vh]"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-xs sm:text-sm text-white capitalize font-semibold bg-purple-600/90 backdrop-blur-sm px-3 py-1.5 rounded shadow-lg">
                        {key}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-gray-500 mt-4 sm:mt-6">
              {language === 'ja' ? '生成日時: ' : 'Generated: '}
              {formatDate(selectedItem.created_at)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Loading state during auth check
  if (isCheckingAuth || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // Not authenticated - will be redirected
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            {language === 'ja' ? 'ログインが必要です' : 'Please sign in to continue'}
          </p>
          <Link
            href="/app?auth=login"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            {language === 'ja' ? 'サインイン' : 'Sign In'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/app" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">{language === 'ja' ? 'アプリに戻る' : 'Back to App'}</span>
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {language === 'ja' ? 'マイコレクション' : 'My Collection'}
            </h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <CollectionFilters
          filters={filters}
          sortOrder={sortOrder}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          language={language}
          totalItems={pagination.totalItems}
        />

        {/* Initial loading state */}
        {initialLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          /* Grid */
          <CollectionGrid
            items={history}
            onSelectItem={setSelectedItem}
            onShareItem={handleShareToX}
            onDeleteItem={handleDelete}
            loading={loading}
            hasMore={pagination.hasMore}
            onLoadMore={handleLoadMore}
            language={language}
          />
        )}
      </main>

      {/* Detail Modal */}
      {renderDetailModal()}
    </div>
  )
}
