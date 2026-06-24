import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppCard } from '../components/AppCard';

export default function AddCustomerScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleSave = async () => {
    const newErrors: typeof errors = {};
    if (!name) newErrors.name = 'Tên khách hàng không được để trống';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await axiosClient.post('/customers', { name, phone, email });
      Alert.alert('Thành công', 'Đã thêm khách hàng mới!');
      navigation.goBack();
    } catch (error: any) {
      console.log('Lỗi thêm KH:', error);
      Alert.alert('Lỗi', 'Không thể thêm khách hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
      <AppCard style={{ padding: 24 }}>
        <AppInput
          label="Tên khách hàng *"
          icon="person-outline"
          placeholder="Nhập tên khách hàng"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          error={errors.name}
        />
        <AppInput
          label="Số điện thoại"
          icon="call-outline"
          placeholder="Ví dụ: 0912345678"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <AppInput
          label="Email"
          icon="mail-outline"
          placeholder="Ví dụ: customer@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </AppCard>

      <AppButton title="LƯU KHÁCH HÀNG" onPress={handleSave} loading={loading} />
    </ScrollView>
  );
}
