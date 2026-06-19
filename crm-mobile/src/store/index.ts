import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import authReducer from './authSlice';
import customerReducer from './customerSlice';
import taskReducer from './taskSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    task: taskReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
