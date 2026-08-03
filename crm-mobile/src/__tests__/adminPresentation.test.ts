import { apiErrorMessage, highRiskSecurityEvents, metadataSummary, securityEventLabels } from '../screens/admin/adminPresentation';

describe('Admin Lite presentation helpers', () => {
  it('maps audited event codes to Vietnamese labels', () => {
    expect(securityEventLabels.ACCESS_DENIED).toBe('Từ chối truy cập');
    expect(highRiskSecurityEvents).toContain('REFRESH_REUSE_DETECTED');
  });

  it('uses backend error messages and a safe fallback', () => {
    expect(apiErrorMessage({ response: { data: { message: 'Không thể tự khóa' } } })).toBe('Không thể tự khóa');
    expect(apiErrorMessage(new Error('network'))).toContain('Vui lòng thử lại');
  });

  it('summarizes metadata without exposing an unbounded payload', () => {
    const result = metadataSummary({ method: 'PATCH', path: '/api/users/1', role: 'ADMIN', required: ['x'], ignored: 'value' });
    expect(result).toContain('method: PATCH');
    expect(result).toContain('required: ["x"]');
    expect(result).not.toContain('ignored');
  });
});
