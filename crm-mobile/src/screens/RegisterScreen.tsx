import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppCard } from '../components/AppCard';

export default function RegisterScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!fullName) newErrors.fullName = 'Tên không được để trống';
    if (!email) newErrors.email = 'Email không được để trống';
    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await axiosClient.post('/auth/register', {
        full_name: fullName,
        email,
        password,
      });
      Alert.alert('Thành công', 'Đăng ký thành công, vui lòng đăng nhập');
      navigation.navigate('Login');
    } catch (error: any) {
      console.log('--- CHI TIẾT LỖI ĐĂNG KÝ ---');
      console.log(error.message);
      console.log(error.response?.data);
      Alert.alert('Lỗi', error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 24, justifyContent: 'center', minHeight: '100%' }}>
      {/* Logo / Title */}
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <View style={{
          width: 72, height: 72, borderRadius: 20,
          backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16
        }}>
          <Ionicons name="person-add" size={36} color="#fff" />
        </View>
        <Text style={{ fontSize: 28, fontWeight: '800', color: theme.textPrimary }}>CRM Pro</Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>Tạo tài khoản mới</Text>
      </View>

      {/* Form */}
      <AppCard style={{ padding: 24 }}>
        <AppInput
          label="Họ và Tên"
          icon="person-outline"
          placeholder="Nhập họ và tên"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            if (errors.fullName) setErrors({ ...errors, fullName: undefined });
          }}
          error={errors.fullName}
        />
        <AppInput
          label="Email"
          icon="mail-outline"
          placeholder="your@email.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.email}
        />
        <AppInput
          label="Mật khẩu"
          icon="lock-closed-outline"
          placeholder="••••••••"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors({ ...errors, password: undefined });
          }}
          isPassword
          error={errors.password}
        />
        <AppInput
          label="Xác nhận mật khẩu"
          icon="lock-closed-outline"
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
          }}
          isPassword
          error={errors.confirmPassword}
        />
        <AppButton title="Đăng ký" onPress={handleRegister} loading={loading} />
      </AppCard>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
          Đã có tài khoản?{' '}
          <Text style={{ color: theme.primary, fontWeight: '700' }}>Đăng nhập ngay</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
