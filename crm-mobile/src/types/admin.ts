import type { UserRole, UserStatus } from '../store/authSlice';

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'TOKEN_ROTATED'
  | 'REFRESH_REUSE_DETECTED'
  | 'LOGOUT'
  | 'SESSION_REVOKED'
  | 'PASSWORD_RESET'
  | 'ACCESS_DENIED'
  | 'ROLE_CHANGED'
  | 'ACCOUNT_STATUS_CHANGED';

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityEvent {
  id: string;
  userId?: string | null;
  type: SecurityEventType;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user?: { id: string; full_name: string; email: string } | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminOverview {
  generatedAt: string;
  users: {
    total: number;
    byRole: Partial<Record<UserRole, number>>;
    byStatus: Partial<Record<UserStatus, number>>;
  };
  customers: { total: number };
  tasks: { total: number; byStatus: Record<string, number> };
  sessions: { active: number };
  security: { alerts24h: number; recentEvents: SecurityEvent[] };
}

export interface Page<T> {
  items: T[];
  pagination: Pagination;
}
