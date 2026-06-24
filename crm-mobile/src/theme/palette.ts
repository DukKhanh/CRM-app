export const lightTheme = {
  colors: {
    background: '#f5f7fb',
    surface: '#ffffff',
    card: '#ffffff',
    textPrimary: '#0f1722',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    accent: '#2563eb',
    button: '#0ea5a4',
    danger: '#ef4444',
    muted: '#9ca3af'
  }
};

export const darkTheme = {
  colors: {
    background: '#0b1220', // deep blue-black
    surface: '#0f1724',
    card: '#111827',
    textPrimary: '#e6eef8',
    textSecondary: '#9ca3af',
    border: '#1f2937',
    accent: '#60a5fa',
    button: '#f59e0b',
    danger: '#ef4444',
    muted: '#94a3b8'
  }
};

export type ThemeType = typeof lightTheme;
