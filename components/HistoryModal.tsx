'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { composeGridImages, generateTwitterShareUrl } from '@/lib/imageComposer'

interface ImageHistoryItem {
  id: string
  generation_type: 'concept' | 'character_sheet' | 'facial_expressions'
  prompt?: string
  aspect_ratio?: string
  additional_prompt?: string
  images: Record<string, string> | string
  created_at: string
}

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { t } = useLanguage()
  const [history, setHistory] = useState<ImageHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ImageHistoryItem | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchHistory()
      // モバイルで背景がスクロールしないようにする
      document.body.style.overflow = 'hidden'
    } else {
      // モーダルを閉じた時にスクロールを復元
      document.body.style.overflow = 'unset'
    }

    // クリーンアップ
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/history')
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この履歴を削除してもよろしいですか？')) return

    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setHistory(history.filter((item) => item.id !== id))
        if (selectedItem?.id === id) {
          setSelectedItem(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete history:', error)
    }
  }

  const getGenerationTypeLabel = (type: string) => {
    switch (type) {
      case 'concept':
        return 'コンセプトアート'
      case 'character_sheet':
        return 'キャラクターシート'
      case 'facial_expressions':
        return '表情差分'
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleShareToX = async (item: ImageHistoryItem) => {
    try {
      let imageToShare: string
      let filename: string
      let shareText: string

      if (typeof item.images === 'string') {
        // コンセプトアート（1枚画像）
        imageToShare = item.images
        filename = 'vtuber-concept-art.png'
        shareText = `VTuberのコンセプトアートを生成しました！\n\n#四面図AI #VTuber #AIart`
      } else {
        // キャラクターシートまたは表情差分（4枚画像）
        const labels: Record<string, string> = item.generation_type === 'character_sheet'
          ? { front: '正面', back: '背面', left: '左側', right: '右側' }
          : { joy: '喜', anger: '怒', sorrow: '哀', surprise: '驚' }

        imageToShare = await composeGridImages(item.images, labels)
        filename = item.generation_type === 'character_sheet'
          ? 'vtuber-four-view.png'
          : 'vtuber-expressions.png'
        shareText = item.generation_type === 'character_sheet'
          ? `VTuberの四面図を生成しました！\n\n#四面図AI #VTuber #AIart`
          : `VTuberの表情差分を生成しました！\n\n#四面図AI #VTuber #AIart`
      }

      // 画像をダウンロード
      const link = document.createElement('a')
      link.href = imageToShare
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // ダウンロード完了を待ってからXに遷移
      await new Promise(resolve => setTimeout(resolve, 500))

      // Xシェア画面を開く
      const appUrl = window.location.origin
      const twitterUrl = generateTwitterShareUrl(shareText, appUrl)
      window.open(twitterUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error sharing to X:', error)
      alert('シェア用画像の生成に失敗しました')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-0 sm:p-4 pt-2 sm:pt-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-7xl max-h-[80vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">生成履歴</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1"
            aria-label="閉じる"
          >
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 min-h-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p>まだ生成履歴がありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition cursor-pointer flex flex-col"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-gray-600 relative flex-shrink-0">
                    {typeof item.images === 'string' ? (
                      <img
                        src={item.images}
                        alt="Generated"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-1 p-1 h-full">
                        {Object.values(item.images)
                          .slice(0, 4)
                          .map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`View ${idx + 1}`}
                              className="w-full h-full object-cover rounded"
                            />
                          ))}
                      </div>
                    )}

                    {/* Overlay Labels */}
                    <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start gap-2 z-10">
                      <span className="text-xs bg-purple-600/90 backdrop-blur-sm text-white px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {getGenerationTypeLabel(item.generation_type)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShareToX(item)
                          }}
                          className="bg-black/90 backdrop-blur-sm text-white hover:bg-gray-900 transition flex-shrink-0 p-1.5 rounded shadow-lg"
                          aria-label="Xでシェア"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(item.id)
                          }}
                          className="bg-red-500/90 backdrop-blur-sm text-white hover:bg-red-600 transition flex-shrink-0 p-1.5 rounded shadow-lg"
                          aria-label="削除"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
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
                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 mb-2">
                        {item.prompt}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedItem && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-start sm:items-center justify-center z-[60] p-0 sm:p-4 pt-2 sm:pt-4"
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>Xでシェア</span>
                  </button>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-white transition p-1 flex-shrink-0 ml-4"
                  aria-label="閉じる"
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
                    <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">プロンプト:</p>
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
                  ) : (
                    Object.entries(selectedItem.images).map(([key, url]) => (
                      <div key={key} className="relative">
                        <img
                          src={url}
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
                  生成日時: {formatDate(selectedItem.created_at)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
