import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchCustomers } from '../store/customerSlice';
import { fetchTasks } from '../store/taskSlice';
import axiosClient from '../api/axiosClient';
import { RootState, AppDispatch } from '../store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppCard } from '../components/AppCard';

export default function EditTaskScreen({ route, navigation }: any) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const customers = useSelector((state: RootState) => state.customer.list);

  // Lấy task cũ được truyền sang
  const { task } = route.params;

  const [title, setTitle] = useState(task.title || '');
  const [customerId, setCustomerId] = useState(task.customer_id ? String(task.customer_id) : '');
  const [deadline, setDeadline] = useState(new Date(task.deadline || Date.now()));
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; customerId?: string }>({});

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const handleUpdate = async () => {
    const newErrors: typeof errors = {};
    if (!title) newErrors.title = 'Tên công việc không được để trống';
    if (!customerId) newErrors.customerId = 'Bạn phải chọn khách hàng';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      // Gọi API PUT /edit
      await axiosClient.put(`/tasks/${task.id}/edit`, { 
        title, 
        customer_id: customerId, 
        deadline: deadline.toISOString() 
      });
      Alert.alert('Thành công', 'Đã cập nhật công việc!');
      dispatch(fetchTasks()); // Tải lại danh sách
      navigation.goBack();
    } catch (error) { 
      Alert.alert('Lỗi', 'Không thể cập nhật công việc'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
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

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 6, color: theme.textSecondary }}>Chọn Khách hàng *</Text>
          <View style={{
            borderWidth: 1,
            borderColor: errors.customerId ? theme.danger : theme.border,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 0,
            backgroundColor: theme.bgInput,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Ionicons name="person-outline" size={18} color={theme.primary} style={{ marginRight: 8 }} />
            <Picker
              selectedValue={customerId}
              onValueChange={(itemValue) => {
                setCustomerId(itemValue);
                if (errors.customerId) setErrors({ ...errors, customerId: undefined });
              }}
              style={{ flex: 1, color: theme.textPrimary }}
              dropdownIconColor={theme.textPrimary}
            >
              <Picker.Item label="-- Chọn Khách Hàng --" value="" color={theme.textMuted} />
              {customers.map((cust: any) => (
                <Picker.Item key={cust.id} label={cust.name} value={String(cust.id)} color={theme.textPrimary} />
              ))}
            </Picker>
          </View>
          {errors.customerId && <Text style={{ fontSize: 12, marginTop: 4, marginLeft: 2, color: theme.danger }}>{errors.customerId}</Text>}
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 6, color: theme.textSecondary }}>Hạn chót</Text>
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 14,
              backgroundColor: theme.bgInput,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="calendar-outline" size={18} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 15, color: theme.textPrimary }}>
              {deadline.toLocaleDateString('vi-VN')}
            </Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={deadline}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={onChangeDate}
          />
        )}

        {showPicker && Platform.OS === 'ios' && (
          <AppButton title="Đóng" onPress={() => setShowPicker(false)} variant="ghost" style={{ marginBottom: 12 }} />
        )}
      </AppCard>

      <AppButton title="CẬP NHẬT CÔNG VIỆC" variant="warning" onPress={handleUpdate} loading={loading} />
    </ScrollView>
  );
}
