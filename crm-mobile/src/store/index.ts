import { configureStore } from '@reduxjs/toolkit';
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
