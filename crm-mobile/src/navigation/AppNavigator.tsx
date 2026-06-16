import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { RootState } from '../store';

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

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  // Lấy trạng thái đăng nhập từ Redux
  const userToken = useSelector(
    (state: RootState) => state.auth.token
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
            />

            <Stack.Screen
              name="CustomerList"
              component={CustomerListScreen}
              options={{
                title: 'Danh sách Khách Hàng',
                headerShown: true,
              }}
            />

            <Stack.Screen
              name="AddCustomer"
              component={AddCustomerScreen}
              options={{
                title: 'Thêm Khách Hàng',
                headerShown: true,
              }}
            />

            <Stack.Screen
              name="TaskList"
              component={TaskListScreen}
              options={{
                title: 'Danh sách Công Việc',
                headerShown: true,
              }}
            />

            <Stack.Screen
              name="AddTask"
              component={AddTaskScreen}
              options={{
                title: 'Thêm Công Việc',
                headerShown: true,
              }}
            />

            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                title: 'Hồ Sơ Cá Nhân',
                headerShown: true,
              }}
            />

            <Stack.Screen
              name="CustomerDetail"
              component={CustomerDetailScreen}
              options={{ 
                title: 'Chi tiết Khách Hàng', 
                headerShown: true }}
             /> 

             <Stack.Screen
              name="EditCustomer"
              component={EditCustomerScreen}
              options={{ 
                title: 'Chỉnh sửa Khách Hàng', 
                headerShown: true }}
             />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}