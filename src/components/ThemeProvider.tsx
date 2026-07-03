import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { DEFAULT_THEME_ID } from '../themes'

type ColorScheme = 'light' | 'dark'

interface ThemeContextValue {
  themeId: string
  colorScheme: ColorScheme
  setThemeId: (id: string) => void
  toggleColorScheme: () => void
}

const THEME_STORAGE_KEY = 'themeId'
const COLOR_SCHEME_STORAGE_KEY = 'colorScheme'

function getInitialColorScheme(): ColorScheme {
  const saved = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(() =>
    localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_ID,
  )
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(getInitialColorScheme)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', themeId)
    root.setAttribute('data-color-scheme', colorScheme)
  }, [themeId, colorScheme])

  const setThemeId = useCallback((id: string) => {
    localStorage.setItem(THEME_STORAGE_KEY, id)
    setThemeIdState(id)
  }, [])

  const toggleColorScheme = useCallback(() => {
    setColorSchemeState((prev) => {
      const next: ColorScheme = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, next)
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ themeId, colorScheme, setThemeId, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
