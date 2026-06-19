import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../store/authSlice';
import { fetchCustomers } from '../store/customerSlice';
import { fetchTasks } from '../store/taskSlice';
import { RootState, AppDispatch } from '../store';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const customers = useSelector((state: RootState) => state.customer.list);
  const tasks = useSelector((state: RootState) => state.task.list);
  // LOGIC TÍNH TOÁN CHO BIỂU ĐỒ TRẠNG THÁI TASK
  const pendingCount = tasks.filter((t: any) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t: any) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t: any) => t.status === 'Completed').length;
  const chartData = [
    { name: 'Pending', count: pendingCount, color: '#f39c12', legendFontColor: '#333', legendFontSize: 14 },
    { name: 'In Progress', count: inProgressCount, color: '#3498db', legendFontColor: '#333', legendFontSize: 14 },
    { name: 'Completed', count: completedCount, color: '#2ecc71', legendFontColor: '#333', legendFontSize: 14 }
  ];

  useEffect(() => {
    // Mỗi khi vào Dashboard, tải lại số liệu
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Xin chào, {user?.full_name}! 👋</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}><Text style={{color: 'blue', fontWeight: 'bold'}}>⚙️ Cài đặt</Text></TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}><Text style={styles.logoutBtn}>Đăng xuất</Text></TouchableOpacity>
      </View>

      {/* DASHBOARD STATS */}
      <View style={styles.row}>
        <View style={[styles.card, { backgroundColor: '#e3f2fd' }]}>
          <Text style={styles.cardTitle}>Khách Hàng</Text>
          <Text style={styles.cardNumber}>{customers.length}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#fff3e0' }]}>
          <Text style={styles.cardTitle}>Công Việc</Text>
          <Text style={styles.cardNumber}>{tasks.length}</Text>
        </View>
      </View>

      {/* THÊM BIỂU ĐỒ VÀO ĐÂY */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10 }}>Thống kê Công việc</Text>
      <View style={{ alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 10, elevation: 2 }}>
        <PieChart
          data={chartData}
          width={screenWidth - 60}
          height={200}
          chartConfig={{ color: () => `rgba(0, 0, 0, 1)` }}
          accessor={"count"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute // Hiển thị số lượng thực tế thay vì phần trăm
        />
      </View>
    
      {/* MENU NAVIGATION */}
      <View style={styles.menu}>
        <Button title="👥 Danh sách Khách hàng" onPress={() => navigation.navigate('CustomerList')} />
        <View style={{ height: 15 }} />
        <Button title="📋 Danh sách Công việc" color="green" onPress={() => navigation.navigate('TaskList')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  logoutBtn: { color: 'red', fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  card: { flex: 1, padding: 20, borderRadius: 10, alignItems: 'center', marginHorizontal: 5, elevation: 2 },
  cardTitle: { fontSize: 16, color: '#555', fontWeight: 'bold' },
  cardNumber: { fontSize: 30, fontWeight: 'bold', marginTop: 10, color: '#333' },
  menu: { marginTop: 20 }
});