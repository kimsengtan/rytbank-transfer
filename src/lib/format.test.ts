import { formatAccountNumber } from './format';

describe('formatAccountNumber', () => {
  it('groups bank account numbers in fours', () => {
    expect(formatAccountNumber('164002123456')).toBe('1640 0212 3456');
  });

  it('formats Malaysian mobile numbers', () => {
    expect(formatAccountNumber('0123456789')).toBe('012-345 6789');
    expect(formatAccountNumber('01123456789')).toBe('011-2345 6789');
  });
});
