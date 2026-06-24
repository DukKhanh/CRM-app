import React, { useState } from 'react';
import { View, ScrollView, Alert, Modal, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';
import { useDispatch } from 'react-redux';
import { fetchCustomers } from '../store/customerSlice';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppCard } from '../components/AppCard';

export default function EditCustomerScreen({ route, navigation }: any) {
  const { theme } = useTheme();
  const dispatch = useDispatch<any>();
  const { customer } = route.params;

  const [name, setName] = useState(customer.name || '');
  const [phone, setPhone] = useState(customer.phone || '');
  const [email, setEmail] = useState(customer.email || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleUpdate = async () => {
    const newErrors: typeof errors = {};
    if (!name) newErrors.name = 'Tên khách hàng không được để trống';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await axiosClient.put(`/customers/${customer.id}`, { name, phone, email });
      dispatch(fetchCustomers());
      setSuccessModalVisible(true);
    } catch (error: any) {
      console.log('Lỗi cập nhật KH:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật khách hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
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

        <AppButton
          title="CẬP NHẬT KHÁCH HÀNG"
          icon="save-outline"
          variant="warning"
          onPress={handleUpdate}
          loading={loading}
        />
      </ScrollView>

      {/* MODAL: THÀNH CÔNG — nằm ngoài ScrollView để overlay hoạt động đúng */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { setSuccessModalVisible(false); navigation.navigate('CustomerList'); }}
      >
        <View style={styles.successOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => { setSuccessModalVisible(false); navigation.navigate('CustomerList'); }}
          />
          <View style={[styles.dialogContent, { backgroundColor: theme.bgCard }]}>
            <View style={[styles.successIcon, { backgroundColor: theme.successLight }]}>
              <Ionicons name="checkmark" size={36} color={theme.success} />
            </View>
            <Text style={[styles.successTitle, { color: theme.textPrimary }]}>Cập nhật thành công!</Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
              Thông tin khách hàng{' '}
              <Text style={{ fontWeight: '700', color: theme.textPrimary }}>"{name}"</Text>
              {' '}đã được cập nhật.
            </Text>
            <AppButton
              title="Xong"
              icon="checkmark-done-outline"
              onPress={() => { setSuccessModalVisible(false); navigation.navigate('CustomerList'); }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 32,
  },
  dialogContent: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
});