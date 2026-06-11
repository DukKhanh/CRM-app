import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers } from '../store/customerSlice';
import { RootState, AppDispatch } from '../store';

export default function CustomerListScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading } = useSelector((state: RootState) => state.customer);

  // Gọi API mỗi khi màn hình này được focus (hiển thị lên)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(fetchCustomers());
    });
    return unsubscribe;
  }, [navigation]);

  // Thiết kế giao diện từng dòng khách hàng
  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => console.log('Sẽ làm màn Chi tiết sau', item.id)}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.info}>📞 {item.phone || 'Chưa có SĐT'}</Text>
      <Text style={styles.info}>📧 {item.email || 'Chưa có Email'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Chưa có khách hàng nào.</Text>}
        />
      )}

      {/* Nút Dấu + Nổi ở góc dưới */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddCustomer')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', padding: 15, marginHorizontal: 15, marginTop: 15, borderRadius: 8, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  info: { fontSize: 14, color: '#666', marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 50, color: '#888' },
  
  fab: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 30, backgroundColor: 'blue', borderRadius: 30, elevation: 5 },
  fabText: { fontSize: 30, color: 'white', marginTop: -3 }
});
