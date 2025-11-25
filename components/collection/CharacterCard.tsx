'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { ImageHistoryItem, GenerationType, GENERATION_TYPE_LABELS, Live2DPart } from '@/types/collection'

interface CharacterCardProps {
  item: ImageHistoryItem
  onSelect: (item: ImageHistoryItem) => void
  onShare: (item: ImageHistoryItem) => void
  onDelete: (id: string) => void
  language: 'ja' | 'en'
}

const CharacterCard = memo<CharacterCardProps>(function CharacterCard({
  item,
  onSelect,
  onShare,
  onDelete,
  language,
}) {
  const getGenerationTypeLabel = (type: GenerationType) => {
    const labels = GENERATION_TYPE_LABELS[type]
    return labels ? labels[language] : type
  }

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

  // Get thumbnail URL based on image type
  const getThumbnailUrl = (): string | null => {
    if (typeof item.images === 'string') {
      return item.images
    }
    if (item.generation_type === 'live2d_parts' && (item.images as { parts?: Live2DPart[] }).parts) {
      const parts = (item.images as { parts: Live2DPart[] }).parts
      return parts[0]?.image || null
    }
    const images = item.images as Record<string, string>
    const values = Object.values(images)
    return values[0] || null
  }

  // Render thumbnail based on generation type
  const renderThumbnail = () => {
    if (typeof item.images === 'string') {
      // Single image (concept art or pose)
      return (
        <div className="relative w-full h-full">
          <Image
            src={item.images}
            alt={item.prompt || 'Generated image'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover"
            loading="lazy"
          />
        </div>
      )
    }

    if (item.generation_type === 'live2d_parts' && (item.images as { parts?: Live2DPart[] }).parts) {
      // Live2D parts - show grid of first 4 parts
      const parts = (item.images as { parts: Live2DPart[] }).parts
      return (
        <div className="grid grid-cols-2 gap-1 p-1 h-full">
          {parts.slice(0, 4).map((part, idx) => (
            <div key={idx} className="relative w-full h-full">
              <Image
                src={part.image}
                alt={part.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                className="object-cover rounded"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )
    }

    // Character sheet or facial expressions - show 2x2 grid
    const images = item.images as Record<string, string>
    const imageEntries = Object.values(images).slice(0, 4)
    return (
      <div className="grid grid-cols-2 gap-1 p-1 h-full">
        {imageEntries.map((url, idx) => (
          <div key={idx} className="relative w-full h-full">
            <Image
              src={url}
              alt={`View ${idx + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
              className="object-cover rounded"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="bg-gray-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 hover:shadow-xl sm:hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col group active:scale-[0.98] sm:active:scale-[1.02]"
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(item)
        }
      }}
      aria-label={`${getGenerationTypeLabel(item.generation_type)}, ${item.prompt || (language === 'ja' ? '説明なし' : 'No description')}`}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-600 relative flex-shrink-0">
        {renderThumbnail()}

        {/* Overlay Labels */}
        <div className="absolute top-0 left-0 right-0 p-1.5 sm:p-2 flex justify-between items-start gap-1 sm:gap-2 z-10">
          <span className="text-[10px] sm:text-xs bg-purple-600/90 backdrop-blur-sm text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow-lg whitespace-nowrap truncate max-w-[60%]">
            {getGenerationTypeLabel(item.generation_type)}
          </span>
          {/* Buttons - Always visible on mobile, hover on desktop */}
          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            {/* Share to X button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onShare(item)
              }}
              className="bg-black/80 sm:bg-black/90 backdrop-blur-sm text-white hover:bg-gray-900 active:bg-gray-800 transition flex-shrink-0 p-1.5 sm:p-1.5 rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
              aria-label={language === 'ja' ? 'Xでシェア' : 'Share to X'}
            >
              <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id)
              }}
              className="bg-red-500/80 sm:bg-red-500/90 backdrop-blur-sm text-white hover:bg-red-600 active:bg-red-700 transition flex-shrink-0 p-1.5 sm:p-1.5 rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 touch-manipulation"
              aria-label={language === 'ja' ? '削除' : 'Delete'}
            >
              <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-2 sm:p-3 flex-shrink-0">
        {item.prompt && (
          <p className="text-[11px] sm:text-sm text-gray-300 line-clamp-2 mb-1.5 sm:mb-2">{item.prompt}</p>
        )}
        <p className="text-[10px] sm:text-xs text-gray-500">{formatDate(item.created_at)}</p>
      </div>
    </div>
  )
})

export default CharacterCard
