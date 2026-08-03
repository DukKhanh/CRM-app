import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useTheme } from '../context/ThemeContext';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import AdminNavigator from './AdminNavigator';
import CrmNavigator from './CrmNavigator';
import { authenticatedExperience } from '../authorization/permissions';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { theme } = useTheme();
  const { isAuthenticated, isHydrating, user } = useSelector((state: RootState) => state.auth);

  const screenOptions = {
    headerStyle: { backgroundColor: theme.bgHeader },
    headerTintColor: theme.textPrimary,
    headerTitleStyle: { fontWeight: '700' as const, fontSize: 16 },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.bg },
  };

  if (isHydrating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!isAuthenticated ? (
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
        ) : authenticatedExperience(user) === 'admin' ? (
          <Stack.Screen name="AdminApp" component={AdminNavigator} options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="CrmApp" component={CrmNavigator} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
