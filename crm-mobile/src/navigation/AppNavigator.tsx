import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import CustomerListScreen from '../screens/CustomerListScreen';
import AddCustomerScreen from '../screens/AddCustomerScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TaskListScreen from '../screens/TaskListScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CustomerDetailScreen from '../screens/CustomerDetailScreen';
import EditCustomerScreen from '../screens/EditCustomerScreen';
import EditTaskScreen from '../screens/EditTaskScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { theme } = useTheme();
  const userToken = useSelector((state: RootState) => state.auth.token);

  const screenOptions = {
    headerStyle: { backgroundColor: theme.bgHeader },
    headerTintColor: theme.textPrimary,
    headerTitleStyle: { fontWeight: '700' as const, fontSize: 16 },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.bg },
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {userToken == null ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: 'Quên mật khẩu' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="CustomerList"
              component={CustomerListScreen}
              options={{ title: 'Danh sách Khách Hàng' }}
            />

            <Stack.Screen
              name="AddCustomer"
              component={AddCustomerScreen}
              options={{ title: 'Thêm Khách Hàng' }}
            />

            <Stack.Screen
              name="TaskList"
              component={TaskListScreen}
              options={{ title: 'Danh sách Công Việc' }}
            />

            <Stack.Screen
              name="AddTask"
              component={AddTaskScreen}
              options={{ title: 'Thêm Công Việc' }}
            />

            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Hồ Sơ Cá Nhân' }}
            />

            <Stack.Screen
              name="CustomerDetail"
              component={CustomerDetailScreen}
              options={{ title: 'Chi tiết Khách Hàng' }}
            />

            <Stack.Screen
              name="EditCustomer"
              component={EditCustomerScreen}
              options={{ title: 'Chỉnh sửa Khách Hàng' }}
            />

            <Stack.Screen
              name="EditTask"
              component={EditTaskScreen}
              options={{ title: 'Chỉnh sửa Công Việc' }}
            />

            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{ title: 'Đổi mật khẩu' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}