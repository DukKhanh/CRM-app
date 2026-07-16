import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppCard } from '../components/AppCard';

export default function ForgotPasswordScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; otp?: string; newPassword?: string }>({});

  const sendOtp = async () => {
    if (!email) {
      setErrors({ email: 'Email không được để trống' });
      return;
    }
    setLoading(true);
    try {
      await axiosClient.post('/auth/forgot-password', { email });
      Alert.alert('Thành công', 'Vui lòng kiểm tra Email để lấy mã OTP');
      setStep(2);
      setErrors({});
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra, vui lòng thử lại';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    const newErrors: typeof errors = {};
    if (!otp) newErrors.otp = 'Mã OTP không được để trống';
    if (!newPassword) newErrors.newPassword = 'Mật khẩu mới không được để trống';
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;
    
    setLoading(true);
    try {
      await axiosClient.post('/auth/reset-password', { email, otp, newPassword });
      Alert.alert('Thành công', 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigation.navigate('Login');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra, vui lòng thử lại';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 24, justifyContent: 'center', minHeight: '100%' }}>
      {step === 1 ? (
        <>
          {/* Icon */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 20,
              backgroundColor: theme.warningLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16
            }}>
              <Ionicons name="key-outline" size={36} color={theme.warning} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: theme.textPrimary }}>Quên mật khẩu?</Text>
            <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 8, textAlign: 'center' }}>Nhập email của bạn để nhận mã xác nhận</Text>
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
            <AppButton title="Gửi mã OTP" onPress={sendOtp} loading={loading} />
          </AppCard>
        </>
      ) : (
        <>
          {/* Icon */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 20,
              backgroundColor: theme.successLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16
            }}>
              <Ionicons name="checkmark-circle-outline" size={36} color={theme.success} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: theme.textPrimary }}>Xác nhận mã OTP</Text>
            <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 8, textAlign: 'center' }}>Nhập mã từ email để đặt lại mật khẩu</Text>
          </View>

          {/* Form */}
          <AppCard style={{ padding: 24 }}>
            <AppInput
              label="Mã OTP (6 số)"
              icon="shield-checkmark-outline"
              placeholder="000000"
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                if (errors.otp) setErrors({ ...errors, otp: undefined });
              }}
              keyboardType="number-pad"
              error={errors.otp}
            />
            <AppInput
              label="Mật khẩu mới"
              icon="lock-closed-outline"
              placeholder="••••••••"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
              }}
              isPassword
              error={errors.newPassword}
            />
            <AppButton title="Đặt lại mật khẩu" onPress={resetPassword} loading={loading} variant="success" />
          </AppCard>
        </>
      )}
    </ScrollView>
  );
}