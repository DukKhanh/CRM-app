import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'crm.accessToken';
const REFRESH_TOKEN_KEY = 'crm.refreshToken';
const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const tokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY, options),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY, options),
  async save(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken, options),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken, options),
    ]);
  },
  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY, options),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, options),
    ]);
  },
};
