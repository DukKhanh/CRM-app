import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://172.31.98.169:3000/api'; // NHỚ GIỮ NGUYÊN IP CỦA BẠN NHÉ

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Trước khi gửi API đi: Nhét Access Token vào
axiosClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Khi API trả kết quả về: Bắt lỗi 401 (Hết hạn Access Token)
axiosClient.interceptors.response.use(
  (response) => {
    return response; // Nếu thành công thì cho qua bình thường
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Hết hạn Token) VÀ chưa từng thử refresh lần nào
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu là đang thử gọi lại

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          // LƯU Ý: Chỗ này phải dùng "axios.post" (bản gốc) chứ ko dùng "axiosClient.post" để tránh lặp vô tận
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          
          const newToken = res.data.token;

          // Lưu token mới vào máy
          await AsyncStorage.setItem('userToken', newToken);

          // Lắp token mới vào cái request vừa bị lỗi
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Tự động GỌI LẠI cái API vừa bị xịt đó
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        // Nếu chui vào đây tức là Refresh Token cũng đã chết (Quá 7 ngày)
        console.log('Refresh token hết hạn, bắt buộc login lại');
        await AsyncStorage.multiRemove(['userToken', 'refreshToken']);
        // Ứng dụng sẽ tự đá văng ra màn hình Login vì mất token
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;