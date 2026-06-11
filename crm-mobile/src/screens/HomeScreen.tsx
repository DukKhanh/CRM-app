import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../store/authSlice';
import { RootState } from '../store';

export default function HomeScreen({ navigation }: any) {
  const dispatch = useDispatch();
  // Lấy thông tin user từ Redux (đã lưu lúc login)
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = async () => {
    // Xóa token ở bộ nhớ máy
    await AsyncStorage.removeItem('userToken');
    // Xóa state trong Redux -> AppNavigator sẽ tự động đẩy về màn Login
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xin chào, {user?.full_name || 'Bạn'}! 👋</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="👥 Quản lý Khách hàng" 
          // SỬA LẠI DÒNG NÀY ĐỂ CHUYỂN TRANG
          onPress={() => navigation.navigate('CustomerList')} 
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title="Đăng xuất" 
          color="red" 
          onPress={handleLogout} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 40 },
  buttonContainer: { width: '80%', marginBottom: 15 }
});