import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../store/taskSlice';
import axiosClient from '../api/axiosClient';
import { RootState, AppDispatch } from '../store';

export default function TaskListScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { list } = useSelector((state: RootState) => state.task);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(fetchTasks());
    });
    return unsubscribe;
  }, [navigation]);

  // HÀM XỬ LÝ KHI CHỌN TRẠNG THÁI MỚI
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await axiosClient.put(`/tasks/${id}`, { status: newStatus });
      // Cập nhật xong thì gọi hàm fetchTasks để tải lại danh sách mới nhất
      dispatch(fetchTasks());
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  // HÀM HIỂN THỊ MENU CHỌN TRẠNG THÁI KHI BẤM VÀO CÔNG VIỆC
  const handleTaskPress = (task: any) => {
    Alert.alert(
      'Cập nhật tiến độ',
      `Bạn muốn đổi trạng thái cho công việc "${task.title}" thành gì?`,
      [
        { text: '⏳ Pending', onPress: () => updateStatus(task.id, 'Pending') },
        { text: '🔄 In Progress', onPress: () => updateStatus(task.id, 'In Progress') },
        { text: '✅ Completed', onPress: () => updateStatus(task.id, 'Completed') },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  // Giao diện 1 thẻ công việc
  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => handleTaskPress(item)}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.info}>KH: {item.customer?.name}</Text>
      {item.deadline && (
        <Text style={styles.info}>📅 Hạn chót: {new Date(item.deadline).toLocaleDateString('vi-VN')}</Text>
      )}
      <Text style={[
        styles.status, 
        item.status === 'Completed' ? styles.completed : 
        item.status === 'In Progress' ? styles.inProgress : styles.pending
      ]}>
        Trạng thái: {item.status}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có công việc nào.</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddTask')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', padding: 15, marginHorizontal: 15, marginTop: 15, borderRadius: 8, elevation: 2 },
  title: { fontSize: 16, fontWeight: 'bold' },
  info: { fontSize: 14, color: '#666', marginTop: 5 },
  status: { marginTop: 10, fontWeight: 'bold' },
  pending: { color: 'gray' },
  inProgress: { color: '#e67e22' }, // Màu cam
  completed: { color: 'green' },     // Màu xanh
  empty: { textAlign: 'center', marginTop: 50, color: '#888' },
  fab: { position: 'absolute', width: 60, height: 60, right: 20, bottom: 30, backgroundColor: 'blue', borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabText: { fontSize: 30, color: 'white', marginTop: -3 }
});