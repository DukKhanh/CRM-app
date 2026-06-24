import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axiosClient from '../api/axiosClient';
import { updateUser } from '../store/authSlice';
import { RootState } from '../store';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppCard } from '../components/AppCard';

export default function ProfileScreen({ navigation }: any) {
  const { theme, isDark, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Cấp quyền', 'Bạn cần cấp quyền truy cập ảnh để đổi Avatar!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatar(base64Image);
    }
  };

  const handleSave = async () => {
    if (!fullName) return Alert.alert('Lỗi', 'Tên không được để trống');
    setLoading(true);
    try {
      const response = await axiosClient.put('/profile', {
        full_name: fullName,
        avatar: avatar
      });
      dispatch(updateUser(response.data.user));
      Alert.alert('Thành công', 'Đã cập nhật hồ sơ!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
      {/* Avatar */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <TouchableOpacity onPress={pickImage} style={{ position: 'relative' }}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={{ width: 110, height: 110, borderRadius: 55 }} />
          ) : (
            <View style={{
              width: 110, height: 110, borderRadius: 55,
              backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center'
            }}>
              <Text style={{ fontSize: 42, fontWeight: '800', color: theme.primary }}>
                {user?.full_name?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          <View style={{
            position: 'absolute', bottom: 2, right: 2,
            backgroundColor: theme.primary, padding: 7, borderRadius: 20,
            borderWidth: 2, borderColor: theme.bg
          }}>
            <Ionicons name="camera-outline" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '800', color: theme.textPrimary, marginTop: 14 }}>{user?.full_name}</Text>
        <Text style={{ fontSize: 13, color: theme.textSecondary }}>{user?.email}</Text>
      </View>

      {/* Form */}
      <AppCard>
        <AppInput
          label="Họ và Tên"
          icon="person-outline"
          value={fullName}
          onChangeText={setFullName}
        />
        <AppInput
          label="Email"
          icon="mail-outline"
          value={user?.email}
          editable={false}
          style={{ color: theme.textMuted, backgroundColor: theme.bgDisabled }}
        />
        <AppInput
          label="Vai trò"
          icon="shield-outline"
          value={user?.role}
          editable={false}
          style={{ color: theme.textMuted, backgroundColor: theme.bgDisabled }}
        />
      </AppCard>

      {/* Cài đặt ứng dụng */}
      <Text style={{
        fontSize: 13,
        fontWeight: '700',
        color: theme.textSecondary,
        marginTop: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1
      }}>
        Cài đặt ứng dụng
      </Text>
      <AppCard style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isDark ? theme.primaryLight : '#EEF2FF',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Ionicons name="moon-outline" size={20} color={theme.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.textPrimary }}>Giao diện tối</Text>
              <Text style={{ fontSize: 12, color: theme.textSecondary }}>Chuyển đổi Light/Dark Mode</Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#D1D5DB', true: theme.primary }}
            thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor="#E5E7EB"
          />
        </View>
      </AppCard>

      <AppButton
        title="ĐỔI MẬT KHẨU"
        variant="ghost"
        onPress={() => navigation.navigate('ChangePassword')}
        style={{ marginBottom: 12 }}
      />
      <AppButton
        title={loading ? '' : "LƯU THAY ĐỔI"}
        onPress={handleSave}
        loading={loading}
      />
    </ScrollView>
  );
}