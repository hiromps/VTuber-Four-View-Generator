'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-0.5 sm:p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 sm:px-3 text-xs sm:text-sm font-medium rounded-md transition-colors ${
          language === 'en'
            ? 'bg-purple-600 text-white'
            : 'text-gray-300 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ja')}
        className={`px-2 py-1 sm:px-3 text-xs sm:text-sm font-medium rounded-md transition-colors ${
          language === 'ja'
            ? 'bg-purple-600 text-white'
            : 'text-gray-300 hover:text-white'
        }`}
      >
        <span className="hidden sm:inline">日本語</span>
        <span className="sm:hidden">JA</span>
      </button>
    </div>
  )
}
