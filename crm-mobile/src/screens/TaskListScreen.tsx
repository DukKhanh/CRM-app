import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../store/taskSlice';
import axiosClient from '../api/axiosClient';
import { RootState, AppDispatch } from '../store';
import { useTheme } from '../context/ThemeContext';
import { AppCard } from '../components/AppCard';

export default function TaskListScreen({ navigation }: any) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { list } = useSelector((state: RootState) => state.task);

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(fetchTasks());
    });
    return unsubscribe;
  }, [navigation]);

  const getStatusBadge = (status: string) => {
    if (status === 'Completed') return theme.statusCompleted;
    if (status === 'In Progress') return theme.statusInProgress;
    return theme.statusPending;
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await axiosClient.put(`/tasks/${id}`, { status: newStatus });
      dispatch(fetchTasks());
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleTaskPress = (task: any) => {
    setSelectedTask(task);
    setStatusModalVisible(true);
  };

  const handleLongPressTask = (task: any) => {
    setSelectedTask(task);
    setOptionsModalVisible(true);
  };

  const handleUpdateStatusAndClose = async (status: string) => {
    if (!selectedTask) return;
    setStatusModalVisible(false);
    await updateStatus(selectedTask.id, status);
  };

  const handleDeleteAndClose = async () => {
    if (!selectedTask) return;
    setDeleteModalVisible(false);
    try {
      await axiosClient.delete(`/tasks/${selectedTask.id}`);
      Alert.alert('Thành công', 'Đã xóa công việc!');
      dispatch(fetchTasks());
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa');
    }
  };

  const renderItem = ({ item }: any) => {
    const badge = getStatusBadge(item.status);
    return (
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => handleTaskPress(item)}
        onLongPress={() => handleLongPressTask(item)}
      >
        <AppCard style={{ marginHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: theme.textPrimary, flex: 1, marginRight: 10 }}>
              {item.title}
            </Text>
            <View style={{ backgroundColor: badge.bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: badge.text }}>{item.status}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="person-outline" size={13} color={theme.textSecondary} />
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>{item.customer?.name || '—'}</Text>
            </View>
            {item.deadline && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="calendar-outline" size={13} color={theme.textSecondary} />
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                  {new Date(item.deadline).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            )}
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 50, color: theme.textMuted, fontSize: 14 }}>
            Chưa có công việc nào
          </Text>
        }
        contentContainerStyle={{ paddingTop: 16 }}
      />
      <TouchableOpacity
        style={{
          position: 'absolute', right: 20, bottom: 30,
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center',
          elevation: 6, shadowColor: theme.primary, shadowOpacity: 0.4, shadowRadius: 10,
        }}
        onPress={() => navigation.navigate('AddTask')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* MODAL 1: CẬP NHẬT TIẾN ĐỘ */}
      <Modal
        visible={statusModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setStatusModalVisible(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: theme.bgCard, shadowColor: theme.shadowColor }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Cập nhật tiến độ</Text>
            {selectedTask && (
              <Text style={[styles.modalSubTitle, { color: theme.textSecondary }]}>
                {selectedTask.title}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.optionBtn, { backgroundColor: theme.statusPending.bg }]}
              onPress={() => handleUpdateStatusAndClose('Pending')}
            >
              <Ionicons name="time-outline" size={20} color={theme.statusPending.text} style={styles.optionIcon} />
              <Text style={[styles.optionText, { color: theme.statusPending.text }]}>Chờ thực hiện (Pending)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, { backgroundColor: theme.statusInProgress.bg }]}
              onPress={() => handleUpdateStatusAndClose('In Progress')}
            >
              <Ionicons name="sync-outline" size={20} color={theme.statusInProgress.text} style={styles.optionIcon} />
              <Text style={[styles.optionText, { color: theme.statusInProgress.text }]}>Đang thực hiện (In Progress)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, { backgroundColor: theme.statusCompleted.bg }]}
              onPress={() => handleUpdateStatusAndClose('Completed')}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={theme.statusCompleted.text} style={styles.optionIcon} />
              <Text style={[styles.optionText, { color: theme.statusCompleted.text }]}>Đã hoàn thành (Completed)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeBtn, { borderColor: theme.border }]}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>Đóng</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 2: TÙY CHỌN SỬA/XÓA */}
      <Modal
        visible={optionsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setOptionsModalVisible(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: theme.bgCard, shadowColor: theme.shadowColor }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Tùy chọn công việc</Text>
            {selectedTask && (
              <Text style={[styles.modalSubTitle, { color: theme.textSecondary }]}>
                {selectedTask.title}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.optionBtn, { backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border }]}
              onPress={() => {
                setOptionsModalVisible(false);
                navigation.navigate('EditTask', { task: selectedTask });
              }}
            >
              <Ionicons name="create-outline" size={20} color={theme.primary} style={styles.optionIcon} />
              <Text style={[styles.optionText, { color: theme.textPrimary }]}>Chỉnh sửa thông tin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, { backgroundColor: theme.dangerLight }]}
              onPress={() => {
                setOptionsModalVisible(false);
                setDeleteModalVisible(true);
              }}
            >
              <Ionicons name="trash-outline" size={20} color={theme.danger} style={styles.optionIcon} />
              <Text style={[styles.optionText, { color: theme.danger }]}>Xóa công việc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeBtn, { borderColor: theme.border }]}
              onPress={() => setOptionsModalVisible(false)}
            >
              <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>Đóng</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 3: XÁC NHẬN XÓA */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setDeleteModalVisible(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: theme.bgCard, shadowColor: theme.shadowColor }]} onPress={(e) => e.stopPropagation()}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.dangerLight, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Ionicons name="warning-outline" size={28} color={theme.danger} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.textPrimary, marginBottom: 6 }]}>Xác nhận xóa</Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 }}>
                Bạn có chắc chắn muốn xóa vĩnh viễn công việc này? Hành động này không thể hoàn tác.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={[styles.dialogBtn, { backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border, flex: 1 }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogBtn, { backgroundColor: theme.danger, flex: 1 }]}
                onPress={handleDeleteAndClose}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    padding: 24,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubTitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  closeBtn: {
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dialogBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});