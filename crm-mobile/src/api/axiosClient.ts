import axios from 'axios';
import { tokenStorage } from '../auth/tokenStorage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!BASE_URL) throw new Error('EXPO_PUBLIC_API_URL is not configured');
let refreshPromise: Promise<string> | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void): void => {
  unauthorizedHandler = handler;
};

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const skipRefresh = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/refresh']
      .some((path) => originalRequest?.url?.endsWith(path));

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !skipRefresh) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const refreshToken = await tokenStorage.getRefreshToken();
            if (!refreshToken) throw new Error('Missing refresh token');
            const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
            await tokenStorage.save(res.data.token, res.data.refreshToken);
            return res.data.token as string;
          })().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch {
        await tokenStorage.clear();
        unauthorizedHandler?.();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
