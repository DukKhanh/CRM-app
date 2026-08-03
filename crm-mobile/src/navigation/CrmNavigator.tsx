import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import CustomerListScreen from '../screens/CustomerListScreen';
import AddCustomerScreen from '../screens/AddCustomerScreen';
import CustomerDetailScreen from '../screens/CustomerDetailScreen';
import EditCustomerScreen from '../screens/EditCustomerScreen';
import TaskListScreen from '../screens/TaskListScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

const Stack = createNativeStackNavigator();

export default function CrmNavigator() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.bgHeader }, headerTintColor: theme.textPrimary, headerTitleStyle: { fontWeight: '700', fontSize: 16 }, headerShadowVisible: false, contentStyle: { backgroundColor: theme.bg } }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: 'Danh sách Khách Hàng' }} />
      <Stack.Screen name="AddCustomer" component={AddCustomerScreen} options={{ title: 'Thêm Khách Hàng' }} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Chi tiết Khách Hàng' }} />
      <Stack.Screen name="EditCustomer" component={EditCustomerScreen} options={{ title: 'Chỉnh sửa Khách Hàng' }} />
      <Stack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'Danh sách Công Việc' }} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Thêm Công Việc' }} />
      <Stack.Screen name="EditTask" component={EditTaskScreen} options={{ title: 'Chỉnh sửa Công Việc' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ Sơ Cá Nhân' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Đổi mật khẩu' }} />
    </Stack.Navigator>
  );
}
