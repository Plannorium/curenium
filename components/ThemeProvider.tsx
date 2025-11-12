"use client";
import React, { useEffect, createContext, useContext, Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from '../app/lib/use-local-storage';

type Theme = 'dark' | 'light';
type Font = "inter" | "manrope" | "system";

type ThemeContextType = {
  theme: Theme;
  font: Font;
  toggleTheme: () => void;
  setFont: Dispatch<SetStateAction<Font>>;
  setTheme: Dispatch<SetStateAction<Theme>>;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  const [font, setFont] = useLocalStorage<Font>('font', 'inter');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings/appearance");
        if (response.ok) {
          const data = (await response.json()) as { theme?: Theme; font?: Font };
          if (data.theme) setTheme(data.theme);
          if (data.font) setFont(data.font);
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(prefersDark ? 'dark' : 'light');
        }
      } catch (_error) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    };

    const cachedTheme = localStorage.getItem('theme');
    const cachedFont = localStorage.getItem('font');

    if (!cachedTheme || !cachedFont) {
      fetchSettings();
    }
  }, [setTheme, setFont]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty("--font-sans", `var(--font-${font})`);
  }, [font]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return <ThemeContext.Provider value={{
    theme,
    font,
    toggleTheme,
    setFont,
    setTheme
  }}>
    {children}
  </ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};