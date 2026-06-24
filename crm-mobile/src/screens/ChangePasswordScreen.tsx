import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppCard } from '../components/AppCard';

export default function ChangePasswordScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ oldPassword?: string; newPassword?: string; confirmPassword?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!oldPassword) newErrors.oldPassword = 'Mật khẩu cũ không được để trống';
    if (!newPassword) newErrors.newPassword = 'Mật khẩu mới không được để trống';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await axiosClient.put('/profile/change-password', { oldPassword, newPassword });
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
      {/* Icon */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View style={{
          width: 72, height: 72, borderRadius: 20,
          backgroundColor: theme.warningLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16
        }}>
          <Ionicons name="lock-closed-outline" size={36} color={theme.warning} />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '800', color: theme.textPrimary }}>Đổi mật khẩu</Text>
        <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 8, textAlign: 'center' }}>Cập nhật mật khẩu của bạn để bảo vệ tài khoản</Text>
      </View>

      {/* Form */}
      <AppCard style={{ padding: 24 }}>
        <AppInput
          label="Mật khẩu cũ"
          icon="lock-closed-outline"
          placeholder="Nhập mật khẩu cũ"
          value={oldPassword}
          onChangeText={(text) => {
            setOldPassword(text);
            if (errors.oldPassword) setErrors({ ...errors, oldPassword: undefined });
          }}
          isPassword
          error={errors.oldPassword}
        />
        <AppInput
          label="Mật khẩu mới"
          icon="lock-open-outline"
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
          }}
          isPassword
          error={errors.newPassword}
        />
        <AppInput
          label="Xác nhận mật khẩu"
          icon="lock-closed-outline"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
          }}
          isPassword
          error={errors.confirmPassword}
        />
        <AppButton title="ĐỔI MẬT KHẨU" onPress={handleChangePassword} loading={loading} variant="warning" />
      </AppCard>
    </ScrollView>
  );
}
