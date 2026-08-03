import type { SecurityEventType } from '../../types/admin';

export const securityEventLabels: Record<SecurityEventType, string> = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGIN_FAILURE: 'Đăng nhập thất bại',
  TOKEN_ROTATED: 'Làm mới phiên',
  REFRESH_REUSE_DETECTED: 'Phát hiện tái sử dụng token',
  LOGOUT: 'Đăng xuất',
  SESSION_REVOKED: 'Thu hồi phiên',
  PASSWORD_RESET: 'Đặt lại mật khẩu',
  ACCESS_DENIED: 'Từ chối truy cập',
  ROLE_CHANGED: 'Thay đổi vai trò',
  ACCOUNT_STATUS_CHANGED: 'Thay đổi trạng thái tài khoản',
};

export const highRiskSecurityEvents: readonly SecurityEventType[] = [
  'LOGIN_FAILURE',
  'REFRESH_REUSE_DETECTED',
  'ACCESS_DENIED',
];

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function apiErrorMessage(error: unknown): string {
  const candidate = error as { response?: { data?: { message?: string } } };
  return candidate.response?.data?.message ?? 'Không thể hoàn thành yêu cầu. Vui lòng thử lại.';
}

export function metadataSummary(metadata: Record<string, unknown>): string {
  return Object.entries(metadata)
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`)
    .join(' · ');
}
