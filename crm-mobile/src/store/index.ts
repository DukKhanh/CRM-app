import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './authSlice';
import customerReducer from './customerSlice';
import taskReducer from './taskSlice';
import themeReducer from './themeSlice';
import { logout } from './authSlice';
import { setUnauthorizedHandler } from '../api/axiosClient';


const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['customer', 'task', 'theme'] 
};

const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  task: taskReducer,
  theme: themeReducer, 
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export const persistor = persistStore(store);

setUnauthorizedHandler(() => {
  store.dispatch(logout());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
