import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axiosClient from '../api/axiosClient';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // Bước 1: Nhập email, Bước 2: Nhập OTP
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const sendOtp = async () => {
    try {
      await axiosClient.post('/auth/forgot-password', { email });
      Alert.alert('Thành công', 'Vui lòng kiểm tra Email để lấy mã OTP');
      setStep(2); // Chuyển sang form nhập OTP
    } catch (error: any) { Alert.alert('Lỗi', error.response?.data?.message); }
  };

  const resetPassword = async () => {
    try {
      await axiosClient.post('/auth/reset-password', { email, otp, newPassword });
      Alert.alert('Thành công', 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigation.navigate('Login');
    } catch (error: any) { Alert.alert('Lỗi', error.response?.data?.message); }
  };

  return (
    <View style={styles.container}>
      {step === 1 ? (
        <>
          <Text style={styles.title}>Quên mật khẩu?</Text>
          <TextInput style={styles.input} placeholder="Nhập Email của bạn" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <Button title="Gửi mã OTP" onPress={sendOtp} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Nhập mã xác nhận</Text>
          <TextInput style={styles.input} placeholder="Mã OTP 6 số" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
          <TextInput style={styles.input} placeholder="Mật khẩu mới" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
          <Button title="Đổi mật khẩu" onPress={resetPassword} color="green" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 15, borderRadius: 5 }
});