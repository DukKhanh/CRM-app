import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Thay địa chỉ IP này bằng IP máy tính của bạn hoặc dùng 10.0.2.2 cho Android Emulator
const BASE_URL = 'http://192.168.1.3:3000/api'; 

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn Token vào mỗi request
axiosClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;