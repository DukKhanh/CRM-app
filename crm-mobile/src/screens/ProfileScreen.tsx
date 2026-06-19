import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import axiosClient from '../api/axiosClient';
import { updateUser } from '../store/authSlice';
import { RootState } from '../store';
export default function ProfileScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);

  // Hàm Mở thư viện ảnh
  const pickImage = async () => {
    // Xin quyền truy cập thư viện ảnh
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Cấp quyền', 'Bạn cần cấp quyền truy cập ảnh để đổi Avatar!');
      return;
    }

    // Mở thư viện ảnh (kèm nén ảnh giảm dung lượng)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // Cắt ảnh hình vuông
      quality: 0.3,   // Nén ảnh để không quá nặng
      base64: true,   // Chuyển ảnh thành chuỗi văn bản để gửi lên server
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatar(base64Image); // Hiện ảnh mới ra màn hình
    }
  };

  // Hàm Lưu lên Server
  const handleSave = async () => {
    if (!fullName) return Alert.alert('Lỗi', 'Tên không được để trống');
    setLoading(true);
    try {
      const response = await axiosClient.put('/profile', {
        full_name: fullName,
        avatar: avatar
      });
      
      // Lưu vào Redux
      dispatch(updateUser(response.data.user));
      Alert.alert('Thành công', 'Đã cập nhật hồ sơ!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* KHU VỰC AVATAR */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>Ảnh</Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Text style={{color: 'white', fontSize: 12}}>✏️</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* THÔNG TIN CÁ NHÂN */}
      <Text style={styles.label}>Họ và Tên</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

      <Text style={styles.label}>Email (Không thể đổi)</Text>
      <TextInput style={[styles.input, { backgroundColor: '#e0e0e0', color: '#888' }]} value={user?.email} editable={false} />

      <Text style={styles.label}>Vai trò</Text>
      <TextInput style={[styles.input, { backgroundColor: '#e0e0e0', color: '#888' }]} value={user?.role} editable={false} />
      
      <TouchableOpacity
        style={styles.changePasswordButton}
        onPress={() => navigation.navigate('ChangePassword')}
      >
       <Text style={styles.changePasswordText}>
        ĐỔI MẬT KHẨU
        </Text>
</TouchableOpacity>

      <View style={{ marginTop: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : (
          <Button title="LƯU THAY ĐỔI" onPress={handleSave} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  avatarContainer: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: 'blue' },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, color: '#fff' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'blue', padding: 8, borderRadius: 20 },
  label: { fontWeight: 'bold', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 5, fontSize: 16 },
  changePasswordButton: { backgroundColor: '#ff9800', padding: 12, borderRadius: 5, marginTop: 20, alignItems: 'center' },
  changePasswordText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});