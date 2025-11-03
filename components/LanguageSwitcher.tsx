'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          language === 'en'
            ? 'bg-purple-600 text-white'
            : 'text-gray-300 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ja')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          language === 'ja'
            ? 'bg-purple-600 text-white'
            : 'text-gray-300 hover:text-white'
        }`}
      >
        日本語
      </button>
    </div>
  )
}
