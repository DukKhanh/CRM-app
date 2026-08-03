import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../../api/axiosClient';
import { AppCard } from '../../components/AppCard';
import { useTheme } from '../../context/ThemeContext';
import type { AppDispatch, RootState } from '../../store';
import { logoutSession } from '../../store/authSlice';
import type { AdminOverview } from '../../types/admin';
import { apiErrorMessage, formatDateTime, highRiskSecurityEvents, securityEventLabels } from './adminPresentation';

type IconName = keyof typeof Ionicons.glyphMap;

export default function AdminOverviewScreen({ navigation }: any) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const response = await axiosClient.get<AdminOverview>('/admin/overview');
      setOverview(response.data);
      setError(null);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
    return navigation.addListener('focus', () => void loadOverview(true));
  }, [loadOverview, navigation]);

  const menuItems: Array<{ title: string; subtitle: string; icon: IconName; route: string; color: string }> = [
    { title: 'Quản lý người dùng', subtitle: 'Vai trò và trạng thái tài khoản', icon: 'people-outline', route: 'AdminUsers', color: theme.primary },
    { title: 'Nhật ký bảo mật', subtitle: 'Theo dõi sự kiện truy cập', icon: 'shield-checkmark-outline', route: 'AdminSecurityEvents', color: theme.danger },
    { title: 'Vận hành khách hàng', subtitle: 'Quản lý dữ liệu CRM', icon: 'business-outline', route: 'CustomerList', color: theme.success },
    { title: 'Vận hành công việc', subtitle: 'Theo dõi và phân công', icon: 'clipboard-outline', route: 'TaskList', color: theme.warning },
  ];

  if (loading && !overview) {
    return <View style={[styles.center, { backgroundColor: theme.bg }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadOverview(true)} tintColor={theme.primary} />}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>ADMIN LITE</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Xin chào, {user?.full_name}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Tổng quan vận hành và an toàn hệ thống</Text>
        </View>
        <TouchableOpacity accessibilityLabel="Đăng xuất" onPress={() => void dispatch(logoutSession())} style={[styles.iconButton, { backgroundColor: theme.dangerLight }]}>
          <Ionicons name="log-out-outline" size={21} color={theme.danger} />
        </TouchableOpacity>
      </View>

      {error && <View style={[styles.errorBox, { backgroundColor: theme.dangerLight }]}><Text style={{ color: theme.danger }}>{error}</Text></View>}

      <View style={styles.metricGrid}>
        <MetricCard label="Người dùng" value={overview?.users.total ?? 0} icon="people" color={theme.primary} />
        <MetricCard label="Khách hàng" value={overview?.customers.total ?? 0} icon="business" color={theme.success} />
        <MetricCard label="Công việc" value={overview?.tasks.total ?? 0} icon="clipboard" color={theme.warning} />
        <MetricCard label="Cảnh báo 24h" value={overview?.security.alerts24h ?? 0} icon="warning" color={theme.danger} />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Tác vụ quản trị</Text>
      {menuItems.map((item) => (
        <TouchableOpacity key={item.route} onPress={() => navigation.navigate(item.route)} activeOpacity={0.75}>
          <AppCard style={styles.menuCard}>
            <View style={[styles.menuIcon, { backgroundColor: `${item.color}18` }]}><Ionicons name={item.icon} size={23} color={item.color} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </AppCard>
        </TouchableOpacity>
      ))}

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Tình trạng hệ thống</Text>
      <AppCard>
        <StatusRow label="Phiên đang hoạt động" value={overview?.sessions.active ?? 0} />
        <StatusRow label="Tài khoản Active" value={overview?.users.byStatus.ACTIVE ?? 0} />
        <StatusRow label="Admin" value={overview?.users.byRole.ADMIN ?? 0} last />
      </AppCard>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 0 }]}>Sự kiện gần đây</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AdminSecurityEvents')}><Text style={{ color: theme.primary, fontWeight: '700' }}>Xem tất cả</Text></TouchableOpacity>
      </View>
      <AppCard>
        {overview?.security.recentEvents.length ? overview.security.recentEvents.slice(0, 5).map((event, index) => {
          const highRisk = highRiskSecurityEvents.includes(event.type);
          return (
            <View key={event.id} style={[styles.eventRow, index === Math.min(overview.security.recentEvents.length, 5) - 1 && { borderBottomWidth: 0 }]}>
              <View style={[styles.eventDot, { backgroundColor: highRisk ? theme.danger : theme.success }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.eventTitle, { color: theme.textPrimary }]}>{securityEventLabels[event.type]}</Text>
                <Text style={[styles.eventMeta, { color: theme.textSecondary }]}>{event.user?.email ?? 'Hệ thống'} · {formatDateTime(event.createdAt)}</Text>
              </View>
            </View>
          );
        }) : <Text style={{ color: theme.textSecondary }}>Chưa có sự kiện bảo mật.</Text>}
      </AppCard>

      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileLink}>
        <Ionicons name="person-circle-outline" size={20} color={theme.primary} />
        <Text style={{ color: theme.primary, fontWeight: '700' }}>Hồ sơ và cài đặt cá nhân</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: number; icon: IconName; color: string }) {
  const { theme } = useTheme();
  return (
    <AppCard style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}><Ionicons name={icon} size={20} color={color} /></View>
      <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{label}</Text>
    </AppCard>
  );
}

function StatusRow({ label, value, last = false }: { label: string; value: number; last?: boolean }) {
  const { theme } = useTheme();
  return <View style={[styles.statusRow, { borderBottomColor: theme.border }, last && { borderBottomWidth: 0 }]}><Text style={{ color: theme.textSecondary }}>{label}</Text><Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 18, paddingTop: 52, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 22, gap: 12 },
  eyebrow: { fontSize: 12, fontWeight: '900', letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900' },
  subtitle: { fontSize: 13, marginTop: 4 },
  iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  errorBox: { padding: 12, borderRadius: 10, marginBottom: 14 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  metricCard: { width: '48.5%', marginBottom: 0, minHeight: 128 },
  metricIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  metricValue: { fontSize: 26, fontWeight: '900' },
  metricLabel: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginTop: 14, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 12 },
  menuCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  menuIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { fontSize: 15, fontWeight: '800' },
  menuSubtitle: { fontSize: 12, marginTop: 3 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  eventRow: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#CBD5E1' },
  eventDot: { width: 8, height: 8, borderRadius: 4 },
  eventTitle: { fontWeight: '700', fontSize: 13 },
  eventMeta: { fontSize: 11, marginTop: 3 },
  profileLink: { marginTop: 8, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
});
