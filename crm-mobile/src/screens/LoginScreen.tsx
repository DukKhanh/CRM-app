import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';
import { loginSuccess } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppCard } from '../components/AppCard';

export default function LoginScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email không được để trống';
    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      const { token, refreshToken, user } = response.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      dispatch(loginSuccess({ user, token }));
      
      Alert.alert('Thành công', 'Đăng nhập thành công!');
    } catch (error: any) {
      console.log('--- LỖI ĐĂNG NHẬP ---');
      console.log(error.message);
      console.log(error.response?.data);
      Alert.alert('Lỗi', error.response?.data?.message || 'Đăng nhập thất bại');
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
          <Ionicons name="briefcase" size={36} color="#fff" />
        </View>
        <Text style={{ fontSize: 28, fontWeight: '800', color: theme.textPrimary }}>CRM Pro</Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>Quản lý khách hàng thông minh</Text>
      </View>

      {/* Form */}
      <AppCard style={{ padding: 24 }}>
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
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 }}>
          <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>Quên mật khẩu?</Text>
        </TouchableOpacity>
        <AppButton title="Đăng nhập" onPress={handleLogin} loading={loading} />
      </AppCard>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
          Chưa có tài khoản?{' '}
          <Text style={{ color: theme.primary, fontWeight: '700' }}>Đăng ký ngay</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
