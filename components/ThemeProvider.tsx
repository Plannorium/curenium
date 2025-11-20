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
          // Only update if we don't have localStorage values (first time user)
          const hasLocalTheme = localStorage.getItem('theme') !== null;
          const hasLocalFont = localStorage.getItem('font') !== null;

          if (!hasLocalTheme && data.theme) setTheme(data.theme);
          if (!hasLocalFont && data.font) setFont(data.font);
        }
      } catch (_error) {
        // If API fails and no localStorage, use system preference
        const hasLocalTheme = localStorage.getItem('theme') !== null;
        if (!hasLocalTheme) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(prefersDark ? 'dark' : 'light');
        }
      }
    };

    // Always try to fetch settings for syncing, but don't override localStorage
    fetchSettings();
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
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    // Sync with server if user is logged in
    if (typeof window !== 'undefined') {
      fetch("/api/settings/appearance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: newTheme, font }),
      }).catch((error) => {
        console.error("Failed to sync theme with server:", error);
      });
    }
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