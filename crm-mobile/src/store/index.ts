import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './authSlice';
import customerReducer from './customerSlice';
import taskReducer from './taskSlice';
import themeReducer from './themeSlice';

// 1. Cấu hình những gì sẽ được lưu xuống bộ nhớ điện thoại
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // whitelist: Chỉ định các reducer muốn lưu offline
  whitelist: ['auth', 'customer', 'task'] 
};

// 2. Gộp các reducer lại
const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  task: taskReducer,
  theme: themeReducer, 
});

// 3. Tạo reducer có khả năng lưu trữ (persisted)
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Tắt cảnh báo đỏ của Redux Persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;