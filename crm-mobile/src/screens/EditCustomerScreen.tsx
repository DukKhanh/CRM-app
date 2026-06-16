import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axiosClient from '../api/axiosClient';
import { useDispatch } from 'react-redux';
import { fetchCustomers } from '../store/customerSlice';

export default function EditCustomerScreen({ route, navigation }: any) {
  const dispatch = useDispatch<any>();
  
  // Nhận dữ liệu khách hàng cũ được truyền sang từ màn hình Chi Tiết
  const { customer } = route.params;

  // Gán dữ liệu cũ vào state làm giá trị mặc định
  const [name, setName] = useState(customer.name || '');
  const [phone, setPhone] = useState(customer.phone || '');
  const [email, setEmail] = useState(customer.email || '');

  const handleUpdate = async () => {
    if (!name) return Alert.alert('Lỗi', 'Vui lòng nhập tên khách hàng');

    try {
      // Gọi API PUT để cập nhật
      await axiosClient.put(`/customers/${customer.id}`, {
        name,
        phone,
        email,
      });

      Alert.alert('Thành công', 'Đã cập nhật thông tin khách hàng!');
      
      // Tải lại danh sách khách hàng trong Redux
      dispatch(fetchCustomers()); 
      
      // Chuyển thẳng về màn hình Danh sách (để tải lại dữ liệu mới nhất)
      navigation.navigate('CustomerList'); 
    } catch (error: any) {
      console.log('Lỗi cập nhật KH:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật khách hàng');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tên khách hàng (*)</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nhập tên..." />

      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Nhập SĐT..." />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="Nhập Email..." />

      <View style={{ marginTop: 20 }}>
        <Button title="CẬP NHẬT LƯU TRỮ" color="#f39c12" onPress={handleUpdate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 }
});