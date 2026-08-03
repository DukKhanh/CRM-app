import { authenticatedExperience, hasPermission, Permission } from '../authorization/permissions';
import type { AuthUser } from '../store/authSlice';

function user(permissions: string[]): AuthUser {
  return {
    id: 'user-1',
    full_name: 'Test User',
    email: 'test@example.com',
    role: permissions.includes(Permission.ADMIN_OVERVIEW_READ) ? 'ADMIN' : 'EMPLOYEE',
    status: 'ACTIVE',
    permissions,
  };
}

describe('mobile authorization routing', () => {
  it('opens Admin Lite only from backend-provided permission', () => {
    expect(authenticatedExperience(user([Permission.ADMIN_OVERVIEW_READ]))).toBe('admin');
    expect(authenticatedExperience(user([]))).toBe('crm');
  });

  it('does not infer admin access from a missing user', () => {
    expect(hasPermission(null, Permission.ADMIN_OVERVIEW_READ)).toBe(false);
    expect(authenticatedExperience(null)).toBe('crm');
  });

  it('checks exact permission identifiers', () => {
    expect(hasPermission(user([Permission.USER_READ_ANY]), Permission.USER_READ_ANY)).toBe(true);
    expect(hasPermission(user([Permission.USER_READ_ANY]), Permission.USER_MANAGE_ROLE)).toBe(false);
  });
});
