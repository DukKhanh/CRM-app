import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, AppTheme } from '../theme/theme';

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('themeMode');
        if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
          setThemeMode(savedMode);
        }
      } catch (error) {
        console.error('Failed to load theme mode', error);
      }
    };
    loadThemeMode();
  }, []);

  const isDark = themeMode === 'system' ? colorScheme === 'dark' : themeMode === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = async () => {
    const nextMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
    try {
      await AsyncStorage.setItem('themeMode', nextMode);
    } catch (error) {
      console.error('Failed to save theme mode', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

