import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Props extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
}

export function AppInput({ label, icon, isPassword, error, style, containerStyle, ...rest }: Props) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>}
      <View style={[
        styles.inputRow,
        {
          backgroundColor: theme.bgInput,
          borderColor: focused ? theme.borderFocus : error ? theme.danger : theme.border,
          borderWidth: focused ? 1.5 : 1,
        }
      ]}>
        {icon && (
          <Ionicons name={icon} size={18} color={focused ? theme.primary : theme.textMuted} style={{ marginRight: 8 }} />
        )}
        <TextInput
          style={[styles.input, { color: theme.textPrimary, flex: 1 }, style]}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={isPassword && !showPw}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPw(!showPw)}>
            <Ionicons name={showPw ? 'eye' : 'eye-off'} size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: { fontSize: 15 },
  error: { fontSize: 12, marginTop: 4, marginLeft: 2 },
});
