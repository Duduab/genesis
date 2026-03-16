import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import en from './en.json'
import he from './he.json'

const dictionaries = { en, he }

const I18nContext = createContext()

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => localStorage.getItem('genesis-locale') || 'en')
  const dir = locale === 'he' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dir
    localStorage.setItem('genesis-locale', locale)
  }, [locale, dir])

  const t = useCallback(
    (key, fallback) => getNestedValue(dictionaries[locale], key) ?? fallback ?? key,
    [locale],
  )

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'en' ? 'he' : 'en'))
  }, [])

  return (
    <I18nContext.Provider value={{ locale, dir, t, setLocale, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
