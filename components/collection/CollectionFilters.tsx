'use client'

import React from 'react'
import {
  FilterState,
  SortOrder,
  GenerationType,
  GENERATION_TYPE_LABELS,
  SORT_ORDER_LABELS,
} from '@/types/collection'

interface CollectionFiltersProps {
  filters: FilterState
  sortOrder: SortOrder
  onFilterChange: (filters: FilterState) => void
  onSortChange: (order: SortOrder) => void
  language: 'ja' | 'en'
  totalItems: number
}

export default function CollectionFilters({
  filters,
  sortOrder,
  onFilterChange,
  onSortChange,
  language,
  totalItems,
}: CollectionFiltersProps) {
  const generationTypes: (GenerationType | 'all')[] = [
    'all',
    'concept',
    'character_sheet',
    'facial_expressions',
    'pose_generation',
    'live2d_parts',
  ]

  const sortOrders: SortOrder[] = ['newest', 'oldest', 'type']

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      generationType: e.target.value as GenerationType | 'all',
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchKeyword: e.target.value,
    })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value as SortOrder)
  }

  const clearFilters = () => {
    onFilterChange({
      generationType: 'all',
      dateRange: { start: null, end: null },
      searchKeyword: '',
    })
    onSortChange('newest')
  }

  const hasActiveFilters =
    filters.generationType !== 'all' ||
    filters.searchKeyword !== '' ||
    filters.dateRange.start !== null ||
    filters.dateRange.end !== null

  return (
    <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      {/* Filter controls */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Search Input - Full width on mobile */}
        <div className="w-full">
          <label htmlFor="search-input" className="sr-only">
            {language === 'ja' ? '検索' : 'Search'}
          </label>
          <div className="relative">
            <input
              id="search-input"
              type="text"
              value={filters.searchKeyword}
              onChange={handleSearchChange}
              placeholder={language === 'ja' ? 'プロンプトで検索...' : 'Search by prompt...'}
              className="w-full bg-gray-700 text-white text-sm sm:text-base border border-gray-600 rounded-lg pl-9 sm:pl-10 pr-4 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              aria-label={language === 'ja' ? 'プロンプトで検索' : 'Search by prompt'}
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Filter row: Type filter and Sort */}
        <div className="flex gap-2 sm:gap-3">
          {/* Generation Type Filter */}
          <div className="flex-1 sm:flex-initial">
            <label htmlFor="type-filter" className="sr-only">
              {language === 'ja' ? '生成タイプ' : 'Generation Type'}
            </label>
            <select
              id="type-filter"
              value={filters.generationType}
              onChange={handleTypeChange}
              className="w-full sm:w-auto bg-gray-700 text-white text-sm sm:text-base border border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2212%22%20height%3d%2212%22%20viewBox%3d%220%200%2012%2012%22%3e%3cpath%20fill%3d%22%239ca3af%22%20d%3d%22M2%204l4%204%204-4%22%2f%3e%3c%2fsvg%3e')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8"
              aria-label={language === 'ja' ? '生成タイプでフィルタ' : 'Filter by generation type'}
            >
              {generationTypes.map((type) => (
                <option key={type} value={type}>
                  {GENERATION_TYPE_LABELS[type][language]}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex-1 sm:flex-initial">
            <label htmlFor="sort-filter" className="sr-only">
              {language === 'ja' ? '並び順' : 'Sort Order'}
            </label>
            <select
              id="sort-filter"
              value={sortOrder}
              onChange={handleSortChange}
              className="w-full sm:w-auto bg-gray-700 text-white text-sm sm:text-base border border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2212%22%20height%3d%2212%22%20viewBox%3d%220%200%2012%2012%22%3e%3cpath%20fill%3d%22%239ca3af%22%20d%3d%22M2%204l4%204%204-4%22%2f%3e%3c%2fsvg%3e')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8"
              aria-label={language === 'ja' ? '並び順' : 'Sort order'}
            >
              {sortOrders.map((order) => (
                <option key={order} value={order}>
                  {SORT_ORDER_LABELS[order][language]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom row: Results count and Clear filters */}
        <div className="flex justify-between items-center">
          <p className="text-xs sm:text-sm text-gray-400">
            {language === 'ja'
              ? `${totalItems}件の結果`
              : `${totalItems} ${totalItems === 1 ? 'result' : 'results'}`}
          </p>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 active:text-purple-200 transition flex items-center gap-1 py-1 px-2 -mr-2 rounded"
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="hidden xs:inline">{language === 'ja' ? 'フィルターをクリア' : 'Clear filters'}</span>
              <span className="xs:hidden">{language === 'ja' ? 'クリア' : 'Clear'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
