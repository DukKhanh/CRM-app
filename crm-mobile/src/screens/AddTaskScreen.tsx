import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Platform, Alert, Modal, Pressable, FlatList, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchCustomers } from '../store/customerSlice';
import axiosClient from '../api/axiosClient';
import { RootState, AppDispatch } from '../store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppCard } from '../components/AppCard';

export default function AddTaskScreen({ navigation }: any) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const customers = useSelector((state: RootState) => state.customer.list);

  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; customerId?: string }>({});

  // Modal states
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, []);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const handleSelectCustomer = (cust: any) => {
    setCustomerId(cust.id);
    setCustomerName(cust.name);
    if (errors.customerId) setErrors({ ...errors, customerId: undefined });
    setCustomerModalVisible(false);
  };

  const handleSave = async () => {
    const newErrors: typeof errors = {};
    if (!title) newErrors.title = 'Tên công việc không được để trống';
    if (!customerId) newErrors.customerId = 'Bạn phải chọn khách hàng';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(deadline);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return Alert.alert('Lỗi', 'Không thể chọn Hạn chót ở trong quá khứ!');
    }

    setLoading(true);
    try {
      await axiosClient.post('/tasks', { title, customer_id: customerId, deadline: deadline.toISOString() });
      setSuccessModalVisible(true);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo công việc');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
        <AppCard style={{ padding: 24 }}>
          <AppInput
            label="Tên công việc *"
            icon="clipboard-outline"
            placeholder="Nhập tên công việc"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors({ ...errors, title: undefined });
            }}
            error={errors.title}
          />

          {/* Customer Selector — custom dropdown thay Picker */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 6, color: theme.textSecondary }}>
              Chọn Khách hàng *
            </Text>
            <TouchableOpacity
              onPress={() => setCustomerModalVisible(true)}
              style={[
                styles.selectorBtn,
                {
                  backgroundColor: theme.bgInput,
                  borderColor: errors.customerId ? theme.danger : theme.border,
                },
              ]}
            >
              <Ionicons name="person-outline" size={18} color={theme.primary} style={{ marginRight: 10 }} />
              <Text style={{ flex: 1, fontSize: 15, color: customerName ? theme.textPrimary : theme.textMuted }}>
                {customerName || '-- Chọn Khách Hàng --'}
              </Text>
              <Ionicons name="chevron-down-outline" size={16} color={theme.textMuted} />
            </TouchableOpacity>
            {errors.customerId && (
              <Text style={{ fontSize: 12, marginTop: 4, marginLeft: 2, color: theme.danger }}>
                {errors.customerId}
              </Text>
            )}
          </View>

          {/* Date Picker */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 6, color: theme.textSecondary }}>Hạn chót</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.selectorBtn, { backgroundColor: theme.bgInput, borderColor: theme.border }]}
            >
              <Ionicons name="calendar-outline" size={18} color={theme.primary} style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 15, color: theme.textPrimary }}>
                {deadline.toLocaleDateString('vi-VN')}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={deadline}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={onChangeDate}
            />
          )}

          {showDatePicker && Platform.OS === 'ios' && (
            <AppButton title="Đóng" onPress={() => setShowDatePicker(false)} variant="ghost" style={{ marginBottom: 12 }} />
          )}
        </AppCard>

        <AppButton title="LƯU CÔNG VIỆC" icon="checkmark-outline" onPress={handleSave} loading={loading} />
      </ScrollView>

      {/* MODAL: CHỌN KHÁCH HÀNG — nằm ngoài ScrollView để overlay hoạt động đúng */}
      <Modal
        visible={customerModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCustomerModalVisible(false)}
      >
        <View style={styles.customerOverlay}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setCustomerModalVisible(false)} />
          <View style={[styles.sheetContent, { backgroundColor: theme.bgCard }]}>
            {/* Handle bar */}
            <View style={[styles.handle, { backgroundColor: theme.border }]} />

            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Chọn Khách hàng</Text>

            <FlatList
              data={customers}
              keyExtractor={(item: any) => item.id}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
              renderItem={({ item }: any) => {
                const isSelected = item.id === customerId;
                return (
                  <TouchableOpacity
                    style={[
                      styles.customerItem,
                      isSelected && { backgroundColor: theme.primaryLight },
                    ]}
                    onPress={() => handleSelectCustomer(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.avatar, { backgroundColor: isSelected ? theme.primary : theme.primaryLight }]}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: isSelected ? '#fff' : theme.primary }}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: 15, color: theme.textPrimary, fontWeight: isSelected ? '700' : '400' }}>
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: theme.textMuted, paddingVertical: 24 }}>
                  Chưa có khách hàng nào
                </Text>
              }
            />

            <AppButton
              title="Đóng"
              variant="ghost"
              onPress={() => setCustomerModalVisible(false)}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>

      {/* MODAL: THÀNH CÔNG — nằm ngoài ScrollView để overlay hoạt động đúng */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { setSuccessModalVisible(false); navigation.goBack(); }}
      >
        <View style={styles.successOverlay}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => { setSuccessModalVisible(false); navigation.goBack(); }} />
          <View style={[styles.dialogContent, { backgroundColor: theme.bgCard }]}>
            <View style={[styles.successIcon, { backgroundColor: theme.successLight }]}>
              <Ionicons name="checkmark" size={36} color={theme.success} />
            </View>
            <Text style={[styles.successTitle, { color: theme.textPrimary }]}>Thành công!</Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
              Công việc <Text style={{ fontWeight: '700', color: theme.textPrimary }}>"{title}"</Text> đã được tạo.
            </Text>
            <AppButton
              title="Xong"
              icon="checkmark-done-outline"
              onPress={() => { setSuccessModalVisible(false); navigation.goBack(); }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  // Overlay cho bottom sheet — nền đen mờ phủ toàn màn hình, content dính đáy
  customerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  // Overlay cho success dialog — nền đen mờ, content căn giữa
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 32,
  },
  sheetContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  separator: {
    height: 1,
    marginHorizontal: 4,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
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
