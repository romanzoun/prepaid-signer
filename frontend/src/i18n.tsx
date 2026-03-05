import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Locale = 'de' | 'en' | 'fr'

const STORAGE_KEY = 'justsign.locale'

export const LOCALES: Locale[] = ['de', 'en', 'fr']

export const LOCALE_LABELS: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Francais',
}

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function normalizeLocale(value: string | null | undefined): Locale {
  if (!value) return 'de'
  const lower = value.toLowerCase()
  if (lower.startsWith('fr')) return 'fr'
  if (lower.startsWith('en')) return 'en'
  return 'de'
}

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'de'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored) return normalizeLocale(stored)
  return normalizeLocale(window.navigator.language)
}

export function I18nProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(() => initialLocale ?? detectInitialLocale())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale }), [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
