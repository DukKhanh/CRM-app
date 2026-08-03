import type { AuthUser } from '../store/authSlice';

export const Permission = {
  ADMIN_OVERVIEW_READ: 'admin:overview:read',
  USER_READ_ANY: 'user:read:any',
  USER_MANAGE_ROLE: 'user:manage:role',
  USER_MANAGE_STATUS: 'user:manage:status',
  SECURITY_EVENT_READ: 'security-event:read',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export function hasPermission(user: AuthUser | null, permission: Permission): boolean {
  return Boolean(user?.permissions?.includes(permission));
}

export function authenticatedExperience(user: AuthUser | null): 'admin' | 'crm' {
  return hasPermission(user, Permission.ADMIN_OVERVIEW_READ) ? 'admin' : 'crm';
}
