import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axiosClient from '../api/axiosClient';

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await axiosClient.post('/auth/register', {
        full_name: fullName,
        email: email,
        password: password,
      });
      Alert.alert('Thành công', 'Đăng ký thành công, vui lòng đăng nhập');
      navigation.navigate('Login');
    } catch (error: any) {
      // IN LỖI RA MÀN HÌNH TERMINAL ĐỂ XEM
      console.log('--- CHI TIẾT LỖI ĐĂNG KÝ ---');
      console.log(error.message);
      console.log(error.response?.data);

      Alert.alert('Lỗi', error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Ký</Text>
      <TextInput style={styles.input} placeholder="Họ và Tên" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Đăng ký ngay" onPress={handleRegister} />
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Đã có tài khoản? Đăng nhập
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  link: { color: 'blue', marginTop: 15, textAlign: 'center' }
});
