import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchCustomers } from '../store/customerSlice';
import { RootState, AppDispatch } from '../store';
import { useTheme } from '../context/ThemeContext';
import { AppInput } from '../components/AppInput';
import { AppCard } from '../components/AppCard';

export default function CustomerListScreen({ navigation }: any) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading } = useSelector((state: RootState) => state.customer);
  const [search, setSearch] = React.useState('');

  const filteredList = list.filter((item: any) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.phone && item.phone.includes(search)) ||
    (item.email && item.email.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(fetchCustomers());
    });
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
    >
      <AppCard style={{ marginHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.primary }}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary }}>{item.name}</Text>
            <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>
              {item.phone || 'Chưa có SĐT'}  ·  {item.email || 'Chưa có Email'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </View>
      </AppCard>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <AppInput
          icon="search-outline"
          placeholder="Tìm theo tên, SĐT, email..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 50, color: theme.textMuted, fontSize: 14 }}>
              Chưa có khách hàng nào
            </Text>
          }
          contentContainerStyle={{ paddingTop: 16 }}
        />
      )}

      {/* FAB Button */}
      <TouchableOpacity
        style={{
          position: 'absolute', right: 20, bottom: 30,
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center',
          elevation: 6, shadowColor: theme.primary, shadowOpacity: 0.4, shadowRadius: 10,
        }}
        onPress={() => navigation.navigate('AddCustomer')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
