import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';
import { useDispatch } from 'react-redux';
import { fetchCustomers } from '../store/customerSlice';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppCard } from '../components/AppCard';

export default function CustomerDetailScreen({ route, navigation }: any) {
  const { theme } = useTheme();
  const { customerId } = route.params;

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const dispatch = useDispatch<any>();

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

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await axiosClient.post('/notes', { customer_id: customerId, content: newNote });
      setNewNote('');
      fetchCustomerDetail();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm ghi chú');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa khách hàng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await axiosClient.delete(`/customers/${customerId}`);
            Alert.alert('Thành công', 'Đã xóa!');
            dispatch(fetchCustomers());
            navigation.goBack();
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa');
          }
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />;
  if (!customer) return <Text style={{ textAlign: 'center', marginTop: 50, color: theme.textMuted }}>Không tìm thấy dữ liệu</Text>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20 }}>
      {/* Info Card */}
      <AppCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <View style={{
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 14
          }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: theme.primary }}>
              {customer.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.textPrimary }}>{customer.name}</Text>
            <View style={{
              marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
              backgroundColor: theme.primaryLight, alignSelf: 'flex-start'
            }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary }}>{customer.status}</Text>
            </View>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="call-outline" size={16} color={theme.textSecondary} />
            <Text style={{ color: theme.textSecondary }}>{customer.phone || 'Chưa có SĐT'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="mail-outline" size={16} color={theme.textSecondary} />
            <Text style={{ color: theme.textSecondary }}>{customer.email || 'Chưa có Email'}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <AppButton title="Sửa" icon="create-outline" variant="warning" style={{ flex: 1 }}
            onPress={() => navigation.navigate('EditCustomer', { customer })}
          />
          <AppButton title="Xóa" icon="trash-outline" variant="danger" style={{ flex: 1 }}
            onPress={handleDelete}
          />
        </View>
      </AppCard>

      {/* Notes Section */}
      <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginBottom: 12, marginTop: 24 }}>
        Lịch sử Ghi chú
      </Text>

      <View style={{ marginBottom: 16 }}>
        <AppInput
          placeholder="Nhập nội dung chăm sóc..."
          value={newNote}
          onChangeText={setNewNote}
          style={{ marginBottom: 10 }}
        />

        <AppButton
          title="Gửi"
          onPress={handleAddNote}
          loading={addingNote}
        />
      </View>

      <FlatList
        scrollEnabled={false}
        data={customer.notes || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppCard style={{ borderLeftWidth: 3, borderLeftColor: theme.primary, marginBottom: 8, padding: 12 }}>
            <Text style={{ color: theme.textPrimary }}>{item.content}</Text>
            <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 6, textAlign: 'right' }}>
              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </AppCard>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: theme.textMuted }}>
            Chưa có ghi chú nào
          </Text>
        }
      />
    </ScrollView>
  );
}
