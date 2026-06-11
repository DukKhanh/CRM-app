import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axiosClient from '../api/axiosClient';

export default function AddCustomerScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = async () => {
    if (!name) return Alert.alert('Lỗi', 'Vui lòng nhập tên khách hàng');

    try {
      await axiosClient.post('/customers', {
        name,
        phone,
        email,
      });
      Alert.alert('Thành công', 'Đã thêm khách hàng mới!');
      // Quay lại màn hình danh sách sau khi thêm thành công
      navigation.goBack(); 
    } catch (error: any) {
      console.log('Lỗi thêm KH:', error);
      Alert.alert('Lỗi', 'Không thể thêm khách hàng');
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

      <Button title="LƯU KHÁCH HÀNG" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 }
});
