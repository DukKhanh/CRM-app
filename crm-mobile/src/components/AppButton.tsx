import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'success' | 'warning' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function AppButton({ title, onPress, variant = 'primary', loading, disabled, style, icon }: Props) {
  const { theme } = useTheme();

  const variantStyles = {
    primary: { bg: theme.primary, text: theme.textOnPrimary },
    danger: { bg: theme.danger, text: '#fff' },
    success: { bg: theme.success, text: '#fff' },
    warning: { bg: theme.warning, text: '#fff' },
    ghost: { bg: 'transparent', text: theme.primary },
  }[variant];

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: variantStyles.bg },
        variant === 'ghost' && { borderWidth: 1.5, borderColor: theme.primary },
        (disabled || loading) && { opacity: 0.6 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text} />
      ) : (
        <View style={styles.inner}>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={variantStyles.text}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={[styles.text, { color: variantStyles.text }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
