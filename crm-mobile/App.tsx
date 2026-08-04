import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store'; 
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import type { AppDispatch } from './src/store';
import { bootstrapSession } from './src/store/authSlice';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function SessionBootstrap() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    void dispatch(bootstrapSession());
  }, [dispatch]);
  return <AppNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      {}
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <SessionBootstrap />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
