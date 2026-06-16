import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import axiosClient from '../api/axiosClient';
import { useDispatch } from 'react-redux';
import { fetchCustomers } from '../store/customerSlice';

export default function CustomerDetailScreen({ route, navigation }: any) {
  // Lấy ID khách hàng được truyền từ màn hình Danh sách sang
  const { customerId } = route.params;

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  
  const dispatch = useDispatch<any>();
  // Hàm tải dữ liệu khách hàng
  const fetchCustomerDetail = async () => {
    try {
      const response = await axiosClient.get(`/customers/${customerId}`);
      setCustomer(response.data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetail();
  }, [customerId]);

  // Hàm thêm ghi chú
  const handleAddNote = async () => {
    if (!newNote) return;
    try {
      await axiosClient.post('/notes', { customer_id: customerId, content: newNote });
      setNewNote(''); // Xóa trắng ô nhập
      fetchCustomerDetail(); // Tải lại danh sách để hiện ghi chú mới
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm ghi chú');
    }
  };

  // Hàm Xóa Khách Hàng
  const handleDelete = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa khách hàng này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await axiosClient.delete(`/customers/${customerId}`);
            Alert.alert('Thành công', 'Đã xóa!');
            dispatch(fetchCustomers()); // Cập nhật lại danh sách ngoài kia
            navigation.goBack(); // Quay về trang trước
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa');
          }
      }}
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="blue" style={{ marginTop: 50 }} />;
  if (!customer) return <Text style={styles.empty}>Không tìm thấy dữ liệu</Text>;

  return (
    <View style={styles.container}>
      {/* THÔNG TIN CHUNG */}
      <View style={styles.infoCard}>
        <Text style={styles.name}>{customer.name}</Text>
        <Text>📞 {customer.phone || 'Chưa có SĐT'}</Text>
        <Text>📧 {customer.email || 'Chưa có Email'}</Text>
        <Text>Trạng thái: <Text style={{fontWeight: 'bold', color: 'blue'}}>{customer.status}</Text></Text>
        <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => navigation.navigate('EditCustomer', { customer })} style={styles.editBtn}>
            <Text style={{color: 'white'}}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={{color: 'white'}}> Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Lịch sử Ghi chú</Text>
      
      {/* KHU VỰC NHẬP GHI CHÚ MỚI */}
      <View style={styles.addNoteContainer}>
        <TextInput 
          style={styles.noteInput} 
          placeholder="Nhập nội dung chăm sóc..." 
          value={newNote} 
          onChangeText={setNewNote} 
        />
        <Button title="Gửi" onPress={handleAddNote} />
      </View>

      {/* DANH SÁCH GHI CHÚ */}
      <FlatList
        data={customer.notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <Text>{item.content}</Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có ghi chú nào.</Text>}
      />

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  infoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, elevation: 2, marginBottom: 20 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  addNoteContainer: { flexDirection: 'row', marginBottom: 15 },
  noteInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginRight: 10, backgroundColor: '#fff' },
  noteCard: { backgroundColor: '#fff', padding: 12, borderRadius: 5, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: 'blue' },
  time: { fontSize: 11, color: '#888', marginTop: 5, textAlign: 'right' },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
  editBtn: { backgroundColor: '#f39c12', padding: 8, borderRadius: 5 },
  deleteBtn: { backgroundColor: '#e74c3c', padding: 8, borderRadius: 5 },
});
