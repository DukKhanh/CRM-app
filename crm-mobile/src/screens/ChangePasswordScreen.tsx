import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axiosClient from '../api/axiosClient';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePasswordScreen({ navigation }: any) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChangePassword = async () => {
    try {
      await axiosClient.put('/profile/change-password', { oldPassword, newPassword });
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
      navigation.goBack();
    } catch (error: any) { Alert.alert('Lỗi', error.response?.data?.message); }
  };

  return (
    <View style={styles.container}>
        <Text style={styles.label}>Mật khẩu cũ</Text>
<View style={styles.passwordContainer}>
  <TextInput
    style={styles.passwordInput}
    placeholder="Nhập mật khẩu cũ"
    value={oldPassword}
    onChangeText={setOldPassword}
    secureTextEntry={!showOldPassword}
  />

  <TouchableOpacity
    onPress={() => setShowOldPassword(!showOldPassword)}
  >
    <Ionicons
      name={showOldPassword ? 'eye' : 'eye-off'}
      size={20}
      color="gray"
    />
  </TouchableOpacity>
</View>

<Text style={styles.label}>Mật khẩu mới</Text>
<View style={styles.passwordContainer}>
  <TextInput
    style={styles.passwordInput}
    placeholder="Nhập mật khẩu mới"
    value={newPassword}
    onChangeText={setNewPassword}
    secureTextEntry={!showNewPassword}
  />

  <TouchableOpacity
    onPress={() => setShowNewPassword(!showNewPassword)}
  >
    <Ionicons
      name={showNewPassword ? 'eye' : 'eye-off'}
      size={20}
      color="gray"
    />
  </TouchableOpacity>
</View>

<View style={{ marginTop: 20 }}>
  <Button
    title="ĐỔI MẬT KHẨU"
    onPress={handleChangePassword}
    color="orange"
  />
</View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', marginBottom: 5, marginTop: 15 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, paddingHorizontal: 10},
  passwordInput: { flex: 1, paddingVertical: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 }
});
