import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers } from '../store/customerSlice';
import axiosClient from '../api/axiosClient';
import { RootState, AppDispatch } from '../store';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddTaskScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const customers = useSelector((state: RootState) => state.customer.list);
  
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');

    // STATE CHO DEADLINE
  const [deadline, setDeadline] = useState(new Date()); // Mặc định là ngày hôm nay
  const [showPicker, setShowPicker] = useState(false); // Ẩn/hiện khung chọn ngày

  useEffect(() => {
    dispatch(fetchCustomers()); // Tải danh sách KH để chọn
  }, []);

    // Hàm xử lý khi người dùng chọn ngày
  const onChangeDate = (event: any, selectedDate?: Date) => {
    // Trên Android, khi chọn xong nó tự ẩn, ta cần set show = false
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!title || !customerId) return Alert.alert('Lỗi', 'Vui lòng nhập Tên CV và chọn Khách hàng');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(deadline);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return Alert.alert('Lỗi', 'Không thể chọn Hạn chót ở trong quá khứ!');
    }
    
    try {
      await axiosClient.post('/tasks', { title, customer_id: customerId, deadline: deadline.toISOString() });
      Alert.alert('Thành công', 'Đã thêm công việc!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo công việc');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tên công việc (*)</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Nhập tên công việc..." />

      <Text style={styles.label}>Chọn Khách hàng (*)</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={customerId} onValueChange={(itemValue) => setCustomerId(itemValue)}>
          <Picker.Item label="-- Chọn Khách Hàng --" value="" />
          {customers.map((cust: any) => (
            <Picker.Item key={cust.id} label={cust.name} value={cust.id} />
          ))}
        </Picker>
      </View>
      <Text style={styles.label}>Hạn chót (Deadline)</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>📅 {deadline.toLocaleDateString('vi-VN')}</Text>
      </TouchableOpacity>

      {/* COMPONENT CHỌN NGÀY (Chỉ hiện khi showPicker = true) */}
      {showPicker && (
        <DateTimePicker
          value={deadline}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onChangeDate}
        />
      )}
      {/* iOS cần nút "Xong" để tắt Picker */}
      {showPicker && Platform.OS === 'ios' && (
        <Button title="Đóng chọn ngày" onPress={() => setShowPicker(false)} />
      )}
      <View style={{ marginTop: 20 }}>
        <Button title="LƯU CÔNG VIỆC" onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 20 },
  dateButton: { borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 5, backgroundColor: '#f9f9f9', alignItems: 'center' },
  dateText: { fontSize: 16, color: '#333' }
});
