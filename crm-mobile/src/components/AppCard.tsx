import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function AppCard({ children, style }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[
      styles.card,
      {
        backgroundColor: theme.bgCard,
        borderColor: theme.border,
        shadowColor: theme.shadowColor,
      },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
});
