'use client'

import React, { useRef, useCallback, useEffect } from 'react'
import CharacterCard from './CharacterCard'
import { ImageHistoryItem } from '@/types/collection'

interface CollectionGridProps {
  items: ImageHistoryItem[]
  onSelectItem: (item: ImageHistoryItem) => void
  onShareItem: (item: ImageHistoryItem) => void
  onDeleteItem: (id: string) => void
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  language: 'ja' | 'en'
}

export default function CollectionGrid({
  items,
  onSelectItem,
  onShareItem,
  onDeleteItem,
  loading,
  hasMore,
  onLoadMore,
  language,
}: CollectionGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Setup intersection observer for infinite scroll
  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore()
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }
  }, [hasMore, loading, onLoadMore])

  useEffect(() => {
    setupObserver()

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [setupObserver])

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
        <svg
          className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mb-3 sm:mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-400 text-base sm:text-lg mb-1.5 sm:mb-2">
          {language === 'ja' ? 'コレクションがありません' : 'No items in collection'}
        </p>
        <p className="text-gray-500 text-xs sm:text-sm max-w-xs">
          {language === 'ja'
            ? '画像を生成するとここに表示されます'
            : 'Generated images will appear here'}
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Grid - 2 columns on small mobile, scaling up */}
      <div
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6"
        role="grid"
        aria-label={language === 'ja' ? 'キャラクターコレクション' : 'Character Collection'}
      >
        {items.map((item) => (
          <div key={item.id} role="gridcell">
            <CharacterCard
              item={item}
              onSelect={onSelectItem}
              onShare={onShareItem}
              onDelete={onDeleteItem}
              language={language}
            />
          </div>
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-8 sm:h-10 mt-4 sm:mt-6" />

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center items-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* End of list message */}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-6 sm:py-8 text-gray-500 text-xs sm:text-sm">
          {language === 'ja' ? 'すべてのアイテムを表示しました' : "You've reached the end"}
        </div>
      )}
    </div>
  )
}
