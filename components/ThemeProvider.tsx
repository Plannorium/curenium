"use client";
import React, { useEffect, useState, createContext, useContext } from 'react';

type Theme = 'dark' | 'light';
type Font = "inter" | "manrope" | "system";

type ThemeContextType = {
  theme: Theme;
  font: Font;
  toggleTheme: () => void;
  setFont: (font: Font) => void;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [font, setFont] = useState<Font>('inter');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings/appearance");
        if (response.ok) {
          const data = (await response.json()) as { theme?: Theme; font?: Font };
          setTheme(data.theme || "light");
          setFont(data.font || "inter");
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(prefersDark ? 'dark' : 'light');
        }
      } catch (_error) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty("--font-sans", `var(--font-${font})`);
  }, [font]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
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