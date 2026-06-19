import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';
import { loginSuccess } from '../store/authSlice';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      const { token, refreshToken, user } = response.data;

      // Lưu token vào máy
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      
      // Lưu vào Redux
      dispatch(loginSuccess({ user, token }));
      
      Alert.alert('Thành công', 'Đăng nhập thành công!');
      // TODO: Điều hướng sang Dashboard sau này
    } catch (error: any) {
      console.log('--- LỖI ĐĂNG NHẬP ---');
      console.log(error.message);
      console.log(error.response?.data);
      Alert.alert('Lỗi', error.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập CRM</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="gray" />
        </TouchableOpacity>
      </View>
      <Button title="Đăng nhập" onPress={handleLogin} />
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}><Text style={{color: '#007AFF', textAlign: 'center', marginTop: 15,}}>Quên mật khẩu? </Text></TouchableOpacity>
      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Chưa có tài khoản? Đăng ký
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, paddingHorizontal: 10},
  passwordInput: { flex: 1, paddingVertical: 10 },
  link: { color: 'blue', marginTop: 15, textAlign: 'center' }
});
