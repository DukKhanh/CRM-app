import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import axiosClient from '../../api/axiosClient';
import { AppButton } from '../../components/AppButton';
import { AppCard } from '../../components/AppCard';
import { AppInput } from '../../components/AppInput';
import { useTheme } from '../../context/ThemeContext';
import type { RootState } from '../../store';
import type { UserRole, UserStatus } from '../../store/authSlice';
import type { AdminUser, Page } from '../../types/admin';
import { apiErrorMessage, formatDateTime } from './adminPresentation';

const roles: UserRole[] = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
const statuses: UserStatus[] = ['ACTIVE', 'SUSPENDED', 'DISABLED'];
const roleLabels: Record<UserRole, string> = { ADMIN: 'Admin', MANAGER: 'Manager', EMPLOYEE: 'Nhân viên' };
const statusLabels: Record<UserStatus, string> = { ACTIVE: 'Hoạt động', SUSPENDED: 'Tạm khóa', DISABLED: 'Vô hiệu hóa' };

export default function UserManagementScreen() {
  const { theme } = useTheme();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [pageData, setPageData] = useState<Page<AdminUser>>({ items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();
  const [statusFilter, setStatusFilter] = useState<UserStatus | undefined>();
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get<Page<AdminUser>>('/users', {
        params: { page, limit: 20, search: search || undefined, role: roleFilter, status: statusFilter },
      });
      setPageData(response.data);
    } catch (error) {
      Alert.alert('Không tải được người dùng', apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search, statusFilter]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const updateRole = async (role: UserRole) => {
    if (!selected || role === selected.role) return;
    setSaving(true);
    try {
      const response = await axiosClient.patch<AdminUser>(`/users/${selected.id}/role`, { role });
      setSelected(response.data);
      await loadUsers();
    } catch (error) {
      Alert.alert('Không thể đổi vai trò', apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (status: UserStatus) => {
    if (!selected || status === selected.status) return;
    setSaving(true);
    try {
      const response = await axiosClient.patch<AdminUser>(`/users/${selected.id}/status`, { status });
      setSelected(response.data);
      await loadUsers();
    } catch (error) {
      Alert.alert('Không thể đổi trạng thái', apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <View style={styles.filters}>
        <AppInput
          icon="search-outline"
          placeholder="Tìm theo tên hoặc email"
          value={searchInput}
          onChangeText={setSearchInput}
          returnKeyType="search"
          onSubmitEditing={applySearch}
          containerStyle={{ marginBottom: 8 }}
        />
        <View style={styles.searchActions}>
          <AppButton title="Tìm kiếm" onPress={applySearch} style={{ flex: 1, paddingVertical: 11 }} />
          <TouchableOpacity onPress={() => { setSearchInput(''); setSearch(''); setRoleFilter(undefined); setStatusFilter(undefined); setPage(1); }} style={[styles.resetButton, { borderColor: theme.border }]}>
            <Ionicons name="refresh" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <FilterRow label="Vai trò" values={roles} active={roleFilter} labels={roleLabels} onChange={(value) => { setRoleFilter(value); setPage(1); }} />
        <FilterRow label="Trạng thái" values={statuses} active={statusFilter} labels={statusLabels} onChange={(value) => { setStatusFilter(value); setPage(1); }} />
        <Text style={[styles.resultCount, { color: theme.textSecondary }]}>{pageData.pagination.total} tài khoản</Text>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 36 }} size="large" color={theme.primary} /> : (
        <FlatList
          data={pageData.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textSecondary }]}>Không tìm thấy tài khoản phù hợp.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelected(item)} activeOpacity={0.75}>
              <AppCard style={styles.userCard}>
                <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}><Text style={[styles.avatarText, { color: theme.primary }]}>{item.full_name.slice(0, 1).toUpperCase()}</Text></View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text numberOfLines={1} style={[styles.name, { color: theme.textPrimary }]}>{item.full_name}</Text>
                    {item.id === currentUserId && <Text style={[styles.selfBadge, { color: theme.primary, backgroundColor: theme.primaryLight }]}>Bạn</Text>}
                  </View>
                  <Text numberOfLines={1} style={[styles.email, { color: theme.textSecondary }]}>{item.email}</Text>
                  <View style={styles.badges}>
                    <Badge text={roleLabels[item.role]} color={theme.primary} background={theme.primaryLight} />
                    <Badge text={statusLabels[item.status]} color={item.status === 'ACTIVE' ? theme.success : theme.danger} background={item.status === 'ACTIVE' ? theme.successLight : theme.dangerLight} />
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </AppCard>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <View style={styles.pagination}>
              <AppButton title="Trước" variant="ghost" disabled={page <= 1} onPress={() => setPage((value) => value - 1)} style={{ flex: 1, paddingVertical: 10 }} />
              <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>{pageData.pagination.page}/{Math.max(pageData.pagination.totalPages, 1)}</Text>
              <AppButton title="Sau" variant="ghost" disabled={page >= pageData.pagination.totalPages} onPress={() => setPage((value) => value + 1)} style={{ flex: 1, paddingVertical: 10 }} />
            </View>
          }
        />
      )}

      <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.backdrop} onPress={() => !saving && setSelected(null)}>
          <Pressable style={[styles.sheet, { backgroundColor: theme.bgCard }]} onPress={() => undefined}>
            {selected && (
              <>
                <View style={styles.sheetHeader}>
                  <View style={{ flex: 1 }}><Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>{selected.full_name}</Text><Text style={{ color: theme.textSecondary }}>{selected.email}</Text></View>
                  <TouchableOpacity disabled={saving} onPress={() => setSelected(null)}><Ionicons name="close" size={25} color={theme.textSecondary} /></TouchableOpacity>
                </View>
                <Text style={[styles.actionLabel, { color: theme.textPrimary }]}>Vai trò</Text>
                <View style={styles.optionGrid}>{roles.map((role) => <OptionButton key={role} label={roleLabels[role]} active={selected.role === role} disabled={saving} onPress={() => void updateRole(role)} />)}</View>
                <Text style={[styles.actionLabel, { color: theme.textPrimary }]}>Trạng thái tài khoản</Text>
                <View style={styles.optionGrid}>{statuses.map((status) => <OptionButton key={status} label={statusLabels[status]} active={selected.status === status} disabled={saving || (selected.id === currentUserId && status !== 'ACTIVE')} onPress={() => void updateStatus(status)} />)}</View>
                {selected.id === currentUserId && <Text style={[styles.hint, { color: theme.warning }]}>Bạn không thể tự khóa tài khoản đang đăng nhập.</Text>}
                <Text style={[styles.created, { color: theme.textMuted }]}>Tạo lúc {formatDateTime(selected.createdAt)}</Text>
                {saving && <ActivityIndicator style={{ marginTop: 10 }} color={theme.primary} />}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function FilterRow<T extends string>({ label, values, active, labels, onChange }: { label: string; values: T[]; active?: T; labels: Record<T, string>; onChange: (value?: T) => void }) {
  const { theme } = useTheme();
  return <View style={styles.filterRow}><Text style={[styles.filterLabel, { color: theme.textSecondary }]}>{label}</Text><View style={styles.chips}><Chip label="Tất cả" active={!active} onPress={() => onChange(undefined)} />{values.map((value) => <Chip key={value} label={labels[value]} active={active === value} onPress={() => onChange(value)} />)}</View></View>;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  return <TouchableOpacity onPress={onPress} style={[styles.chip, { backgroundColor: active ? theme.primary : theme.bgCard, borderColor: active ? theme.primary : theme.border }]}><Text style={{ color: active ? theme.textOnPrimary : theme.textSecondary, fontSize: 11, fontWeight: '700' }}>{label}</Text></TouchableOpacity>;
}

function Badge({ text, color, background }: { text: string; color: string; background: string }) {
  return <Text style={[styles.badge, { color, backgroundColor: background }]}>{text}</Text>;
}

function OptionButton({ label, active, disabled, onPress }: { label: string; active: boolean; disabled: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  return <TouchableOpacity disabled={disabled || active} onPress={onPress} style={[styles.option, { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primaryLight : theme.bg }, disabled && { opacity: 0.45 }]}><Text style={{ color: active ? theme.primary : theme.textPrimary, fontWeight: '700', fontSize: 12 }}>{label}</Text>{active && <Ionicons name="checkmark-circle" size={16} color={theme.primary} />}</TouchableOpacity>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, filters: { padding: 14, paddingBottom: 6 }, searchActions: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  resetButton: { width: 48, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  filterRow: { marginTop: 8 }, filterLabel: { fontSize: 11, fontWeight: '700', marginBottom: 6 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9, borderWidth: 1 }, resultCount: { fontSize: 12, marginTop: 12 },
  list: { padding: 14, paddingTop: 6, paddingBottom: 32 }, userCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, avatarText: { fontSize: 18, fontWeight: '900' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 }, name: { fontSize: 15, fontWeight: '800', maxWidth: '75%' },
  selfBadge: { fontSize: 9, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, fontWeight: '800' }, email: { fontSize: 12, marginTop: 2 },
  badges: { flexDirection: 'row', gap: 6, marginTop: 8 }, badge: { fontSize: 10, fontWeight: '800', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  pagination: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 6 }, empty: { textAlign: 'center', paddingVertical: 40 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.5)' }, sheet: { padding: 20, paddingBottom: 34, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 }, sheetTitle: { fontSize: 20, fontWeight: '900', marginBottom: 3 },
  actionLabel: { fontSize: 13, fontWeight: '800', marginBottom: 8, marginTop: 6 }, optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  option: { minWidth: '30%', paddingHorizontal: 10, paddingVertical: 11, borderWidth: 1, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  hint: { fontSize: 11, marginBottom: 10 }, created: { fontSize: 11, marginTop: 6 },
});
