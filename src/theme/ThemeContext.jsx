import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback } from 'react'

const ThemeContext = createContext()

function applyThemeClass(dark) {
  const root = document.documentElement
  if (dark) root.classList.add('dark')
  else root.classList.remove('dark')
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('genesis_theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  /* Sync before paint so toggles and first paint match stored preference */
  useLayoutEffect(() => {
    applyThemeClass(dark)
  }, [dark])

  useEffect(() => {
    localStorage.setItem('genesis_theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggleTheme = useCallback(() => setDark((d) => !d), [])

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
