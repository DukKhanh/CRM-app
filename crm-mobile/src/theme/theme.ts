export const lightTheme = {
  mode: 'light' as 'light' | 'dark',

  // Backgrounds
  bg: '#F4F6F9',
  bgCard: '#FFFFFF',
  bgInput: '#FFFFFF',
  bgHeader: '#FFFFFF',
  bgDisabled: '#EDEDED',

  // Brand colors
  primary: '#3B6BF7',        // Xanh dương đậm — màu chủ đạo
  primaryLight: '#EEF2FF',   // Nền nhạt của primary
  primaryDark: '#2753D9',    // Hover / pressed state
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textOnPrimary: '#FFFFFF',

  // Border
  border: '#E5E7EB',
  borderFocus: '#3B6BF7',

  // Shadow
  shadowColor: '#000',

  // Status badge colors
  statusPending: { bg: '#FEF3C7', text: '#92400E' },
  statusInProgress: { bg: '#DBEAFE', text: '#1E40AF' },
  statusCompleted: { bg: '#DCFCE7', text: '#166534' },

  // Chart legend text
  chartLegendColor: '#374151',
};

export const darkTheme: typeof lightTheme = {
  mode: 'dark',

  bg: '#0F172A',
  bgCard: '#1E293B',
  bgInput: '#1E293B',
  bgHeader: '#1E293B',
  bgDisabled: '#334155',

  primary: '#6B8FF7',
  primaryLight: '#1E3A5F',
  primaryDark: '#8FA8F9',
  success: '#4ADE80',
  successLight: '#14532D',
  warning: '#FBBF24',
  warningLight: '#451A03',
  danger: '#F87171',
  dangerLight: '#450A0A',

  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textOnPrimary: '#FFFFFF',

  border: '#334155',
  borderFocus: '#6B8FF7',

  shadowColor: '#000',

  statusPending: { bg: '#451A03', text: '#FCD34D' },
  statusInProgress: { bg: '#1E3A5F', text: '#93C5FD' },
  statusCompleted: { bg: '#14532D', text: '#86EFAC' },

  chartLegendColor: '#CBD5E1',
};

export type AppTheme = typeof lightTheme;
