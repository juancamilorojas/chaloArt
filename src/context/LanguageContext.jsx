import { createContext, useContext, useState, useCallback } from 'react'
import es from '../locales/es.json'
import en from '../locales/en.json'

const dictionaries = { es, en }

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('es')

  const t = useCallback(
    (key) => {
      const keys = key.split('.')
      let value = dictionaries[lang]
      for (const k of keys) {
        value = value?.[k]
      }
      return value || key
    },
    [lang]
  )

  const localized = useCallback(
    (obj) => {
      if (!obj) return ''
      if (typeof obj === 'string') return obj
      return obj[lang] || obj['es'] || ''
    },
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, localized }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
