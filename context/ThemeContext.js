import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@fooddash_theme';

export const DARK = {
  id: 'dark',
  bg: '#0f1a33',
  card: '#1A2744',
  cardAlt: '#243260',
  border: '#2d3e6e',
  borderDark: '#1e2d50',
  text: '#ffffff',
  textSub: '#a0aec0',
  textMuted: '#6b7db3',
  textDim: '#4a5d80',
  textFaint: 'rgba(255,255,255,0.5)',
  textFaint2: 'rgba(255,255,255,0.6)',
  accent: '#F5A623',
  accentText: '#1A2744',
  inputBg: '#243260',
  inputBorder: '#2d3e6e',
  tabBar: '#1e2d50',
  tabBorder: '#2a3f6e',
  tabInactive: '#7a9cc4',
  good: '#22c55e',
  bad: '#ef4444',
  warning: '#ff9800',
  unreadBg: '#111e38',
  logoutBorder: '#3d1a1a',
};

export const LIGHT = {
  id: 'light',
  bg: '#F8FAFB',
  card: '#FFFFFF',
  cardAlt: '#F0F4F8',
  border: '#E2E8F0',
  borderDark: '#E8EFF5',
  text: '#1A2744',
  textSub: '#718096',
  textMuted: '#718096',
  textDim: '#A0AEC0',
  textFaint: 'rgba(26,39,68,0.5)',
  textFaint2: '#718096',
  accent: '#F5A623',
  accentText: '#1A2744',
  inputBg: '#F0F4F8',
  inputBorder: '#E2E8F0',
  tabBar: '#FFFFFF',
  tabBorder: '#E2E8F0',
  tabInactive: '#1A2744',
  good: '#22c55e',
  bad: '#ef4444',
  warning: '#ff9800',
  unreadBg: '#EFF6FF',
  logoutBorder: '#fecaca',
};

const ThemeContext = createContext({ theme: DARK, isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val !== null) setIsDark(val === 'dark');
    });
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  }, [isDark]);

  const value = useMemo(
    () => ({ theme: isDark ? DARK : LIGHT, isDark, toggleTheme }),
    [isDark, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
