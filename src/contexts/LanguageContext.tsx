import React, { createContext, useContext, useState } from 'react'
import type { Locale, TranslationKey } from '../i18n/types'
import { translations } from '../i18n/translations'

interface LanguageContextType {
  locale: Locale
  setLocale: React.Dispatch<React.SetStateAction<Locale>>
  t: Record<TranslationKey, string>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: React.ReactNode
  defaultLocale?: Locale
}

export function LanguageProvider({ children, defaultLocale = 'ja' }: LanguageProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  const value: LanguageContextType = {
    locale,
    setLocale,
    t: translations[locale],
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

/**
 * 翻訳済みテキストを取得するフック
 * @example
 * const { t, locale, setLocale } = useTranslation()
 * <h1>{t.appTitle}</h1>
 */
export function useTranslation() {
  return useLanguage()
}
