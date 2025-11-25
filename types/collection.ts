/**
 * Collection feature type definitions
 * キャラクターコレクション機能の型定義
 */

// Generation types
export type GenerationType = 'concept' | 'character_sheet' | 'facial_expressions' | 'pose_generation' | 'live2d_parts'

// Image history item (matching existing database schema)
export interface ImageHistoryItem {
  id: string
  generation_type: GenerationType
  prompt?: string
  aspect_ratio?: string
  additional_prompt?: string
  images: Record<string, string> | string | { parts?: Live2DPart[] }
  created_at: string
}

// Live2D part structure
export interface Live2DPart {
  name: string
  image: string
  description?: string
}

// Filter state for collection view
export interface FilterState {
  generationType: GenerationType | 'all'
  dateRange: {
    start: Date | null
    end: Date | null
  }
  searchKeyword: string
}

// Sort order options
export type SortOrder = 'newest' | 'oldest' | 'type'

// Pagination state
export interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  hasMore: boolean
}

// API response for collection
export interface CollectionAPIResponse {
  history: ImageHistoryItem[]
  total: number
  hasMore: boolean
}

// Generation type labels (for UI display)
export const GENERATION_TYPE_LABELS: Record<GenerationType | 'all', { ja: string; en: string }> = {
  all: { ja: 'すべて', en: 'All' },
  concept: { ja: 'コンセプトアート', en: 'Concept Art' },
  character_sheet: { ja: 'キャラクターシート', en: 'Character Sheet' },
  facial_expressions: { ja: '表情差分', en: 'Facial Expressions' },
  pose_generation: { ja: 'ポーズ生成', en: 'Pose Generation' },
  live2d_parts: { ja: 'Live2Dパーツ', en: 'Live2D Parts' },
}

// Sort order labels (for UI display)
export const SORT_ORDER_LABELS: Record<SortOrder, { ja: string; en: string }> = {
  newest: { ja: '最新順', en: 'Newest First' },
  oldest: { ja: '古い順', en: 'Oldest First' },
  type: { ja: 'タイプ別', en: 'By Type' },
}

// Default filter state
export const DEFAULT_FILTER_STATE: FilterState = {
  generationType: 'all',
  dateRange: {
    start: null,
    end: null,
  },
  searchKeyword: '',
}

// Default pagination state
export const DEFAULT_PAGINATION_STATE: PaginationState = {
  currentPage: 0,
  itemsPerPage: 20,
  totalItems: 0,
  hasMore: true,
}
