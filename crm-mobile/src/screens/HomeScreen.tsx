import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../store/authSlice';
import { fetchCustomers } from '../store/customerSlice';
import { fetchTasks } from '../store/taskSlice';
import { RootState, AppDispatch } from '../store';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import axiosClient from '../api/axiosClient';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const customers = useSelector((state: RootState) => state.customer.list);
  const tasks = useSelector((state: RootState) => state.task.list);

  const pendingCount = tasks.filter((t: any) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t: any) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t: any) => t.status === 'Completed').length;

  const chartData = [
    { name: 'Pending', count: pendingCount, color: theme.warning, legendFontColor: theme.chartLegendColor, legendFontSize: 13 },
    { name: 'In Progress', count: inProgressCount, color: theme.primary, legendFontColor: theme.chartLegendColor, legendFontSize: 13 },
    { name: 'Completed', count: completedCount, color: theme.success, legendFontColor: theme.chartLegendColor, legendFontSize: 13 },
  ];

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Từ chối quyền thông báo!');
        return;
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

        await axiosClient.put('/profile/push-token', { token });
        console.log('Đã gửi Push Token lên server:', token);
      } catch (error) {
        console.log('Đang chạy trên Expo Go nên tạm thời bị chặn Push Token. Cần build file APK để test tính năng này!');
      }
    } else {
      console.log('Phải dùng điện thoại thật để nhận Push Notification');
    }
  }

  useEffect(() => {
    registerForPushNotificationsAsync();
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(fetchCustomers());
      dispatch(fetchTasks());
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    dispatch(logout());
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20, paddingTop: 52 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <View>
          <Text style={{ fontSize: 13, color: theme.textSecondary }}>Chào mừng trở lại 👋</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: theme.textPrimary }}>{user?.full_name}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}
            style={{ backgroundColor: theme.primaryLight, padding: 10, borderRadius: 12 }}>
            <Ionicons name="settings-outline" size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}
            style={{ backgroundColor: theme.dangerLight, padding: 10, borderRadius: 12 }}>
            <Ionicons name="log-out-outline" size={20} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <AppCard style={{ flex: 1, alignItems: 'center', padding: 20, marginBottom: 0 }}>
          <View style={{ backgroundColor: theme.primaryLight, padding: 10, borderRadius: 12, marginBottom: 10 }}>
            <Ionicons name="people-outline" size={24} color={theme.primary} />
          </View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: theme.textPrimary }}>{customers.length}</Text>
          <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>Khách hàng</Text>
        </AppCard>
        <AppCard style={{ flex: 1, alignItems: 'center', padding: 20, marginBottom: 0 }}>
          <View style={{ backgroundColor: theme.warningLight, padding: 10, borderRadius: 12, marginBottom: 10 }}>
            <Ionicons name="clipboard-outline" size={24} color={theme.warning} />
          </View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: theme.textPrimary }}>{tasks.length}</Text>
          <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>Công việc</Text>
        </AppCard>
      </View>

      {/* Pie Chart */}
      <AppCard style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginBottom: 12 }}>Thống kê Công việc</Text>
        <PieChart
          data={chartData}
          width={screenWidth - 80}
          height={180}
          chartConfig={{ color: () => `rgba(0,0,0,1)`, backgroundColor: theme.bgCard }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="10"
          absolute
        />
      </AppCard>

      {/* Navigation Buttons */}
      <AppButton
        title="Danh sách Khách hàng"
        icon="people-outline"
        onPress={() => navigation.navigate('CustomerList')}
        style={{ marginBottom: 12 }}
      />
      <AppButton
        title="Danh sách Công việc"
        icon="clipboard-outline"
        onPress={() => navigation.navigate('TaskList')}
        variant="ghost"
      />
    </ScrollView>
  );
}