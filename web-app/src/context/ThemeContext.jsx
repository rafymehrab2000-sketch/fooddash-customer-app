import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { DARK, LIGHT } from '../theme'

const ThemeContext = createContext({ theme: DARK, isDark: true, toggleTheme: () => {} })

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ theme: isDark ? DARK : LIGHT, isDark, toggleTheme }),
    [isDark, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
