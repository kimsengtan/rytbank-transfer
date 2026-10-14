import { formatAccountNumber, toLocalNumber } from './format';

describe('formatAccountNumber', () => {
  it('groups bank account numbers in fours', () => {
    expect(formatAccountNumber('164002123456')).toBe('1640 0212 3456');
  });

  it('formats Malaysian mobile numbers', () => {
    expect(formatAccountNumber('0123456789')).toBe('012-345 6789');
    expect(formatAccountNumber('01123456789')).toBe('011-2345 6789');
  });
});

describe('toLocalNumber', () => {
  it('converts +60 numbers to the local format', () => {
    expect(toLocalNumber('+60 12-345 6789')).toBe('0123456789');
  });

  it('leaves account numbers that happen to start with 60 alone', () => {
    expect(toLocalNumber('601234567890')).toBe('601234567890');
  });
});
