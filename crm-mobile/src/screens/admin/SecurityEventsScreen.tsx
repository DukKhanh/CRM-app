import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../../api/axiosClient';
import { AppButton } from '../../components/AppButton';
import { AppCard } from '../../components/AppCard';
import { useTheme } from '../../context/ThemeContext';
import type { Page, SecurityEvent, SecurityEventType } from '../../types/admin';
import { apiErrorMessage, formatDateTime, highRiskSecurityEvents, metadataSummary, securityEventLabels } from './adminPresentation';

const eventFilters: Array<{ label: string; value?: SecurityEventType }> = [
  { label: 'Tất cả' },
  { label: 'Bị từ chối', value: 'ACCESS_DENIED' },
  { label: 'Đăng nhập lỗi', value: 'LOGIN_FAILURE' },
  { label: 'Token reuse', value: 'REFRESH_REUSE_DETECTED' },
  { label: 'Đổi quyền', value: 'ROLE_CHANGED' },
];

export default function SecurityEventsScreen() {
  const { theme } = useTheme();
  const [pageData, setPageData] = useState<Page<SecurityEvent>>({ items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } });
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<SecurityEventType | undefined>();
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get<Page<SecurityEvent>>('/security-events', { params: { page, limit: 20, type: filter } });
      setPageData(response.data);
    } catch (error) {
      Alert.alert('Không tải được nhật ký', apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { void loadEvents(); }, [loadEvents]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <View style={styles.filters}>
        <Text style={[styles.helper, { color: theme.textSecondary }]}>Nhật ký chỉ đọc, dùng để điều tra truy cập và thay đổi quyền.</Text>
        <View style={styles.chips}>{eventFilters.map((item) => {
          const active = filter === item.value;
          return <TouchableOpacity key={item.label} onPress={() => { setFilter(item.value); setPage(1); }} style={[styles.chip, { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primary : theme.bgCard }]}><Text style={{ color: active ? theme.textOnPrimary : theme.textSecondary, fontSize: 11, fontWeight: '700' }}>{item.label}</Text></TouchableOpacity>;
        })}</View>
        <Text style={[styles.total, { color: theme.textSecondary }]}>{pageData.pagination.total} sự kiện</Text>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={theme.primary} /> : (
        <FlatList
          data={pageData.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={() => void loadEvents()}
          refreshing={loading}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textSecondary }]}>Chưa có sự kiện phù hợp.</Text>}
          renderItem={({ item }) => {
            const highRisk = highRiskSecurityEvents.includes(item.type);
            const accent = highRisk ? theme.danger : item.type.includes('CHANGED') ? theme.warning : theme.success;
            return (
              <AppCard style={styles.eventCard}>
                <View style={[styles.icon, { backgroundColor: `${accent}18` }]}><Ionicons name={highRisk ? 'warning-outline' : 'shield-checkmark-outline'} size={21} color={accent} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: theme.textPrimary }]}>{securityEventLabels[item.type]}</Text>
                  <Text style={[styles.meta, { color: theme.textSecondary }]}>{formatDateTime(item.createdAt)}</Text>
                  <Text numberOfLines={1} style={[styles.meta, { color: theme.textSecondary }]}>User: {item.user?.email ?? item.userId ?? 'Không xác định'}{item.ipAddress ? ` · IP: ${item.ipAddress}` : ''}</Text>
                  {item.metadata && <Text numberOfLines={2} style={[styles.detail, { color: theme.textMuted }]}>{metadataSummary(item.metadata)}</Text>}
                </View>
              </AppCard>
            );
          }}
          ListFooterComponent={<View style={styles.pagination}><AppButton title="Trước" variant="ghost" disabled={page <= 1} onPress={() => setPage((value) => value - 1)} style={{ flex: 1, paddingVertical: 10 }} /><Text style={{ color: theme.textSecondary, fontWeight: '700' }}>{pageData.pagination.page}/{Math.max(pageData.pagination.totalPages, 1)}</Text><AppButton title="Sau" variant="ghost" disabled={page >= pageData.pagination.totalPages} onPress={() => setPage((value) => value + 1)} style={{ flex: 1, paddingVertical: 10 }} /></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, filters: { padding: 14, paddingBottom: 7 }, helper: { fontSize: 12, lineHeight: 18, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, borderWidth: 1 },
  total: { fontSize: 12, marginTop: 12 }, list: { padding: 14, paddingTop: 6, paddingBottom: 32 },
  eventCard: { flexDirection: 'row', gap: 12, padding: 14 }, icon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '800' }, meta: { fontSize: 11, marginTop: 3 }, detail: { fontSize: 10, lineHeight: 15, marginTop: 7 },
  empty: { textAlign: 'center', paddingVertical: 40 }, pagination: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 6 },
});
