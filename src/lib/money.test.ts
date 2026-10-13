import { formatMoney, sanitizeAmount, toAmountInput, toSen } from './money';

describe('sanitizeAmount', () => {
  it.each([
    ['12.345', '12.34'],
    ['007', '7'],
    ['0.5', '0.5'],
    ['.5', '0.5'],
    ['RM 1,000', '1000'],
    ['12345678', '1234567'],
    ['', ''],
  ])('turns %p into %p', (input, expected) => {
    expect(sanitizeAmount(input)).toBe(expected);
  });
});

describe('toSen', () => {
  it('converts to integer sen without floating point drift', () => {
    expect(toSen('0.29')).toBe(29);
    expect(toSen('1234.56')).toBe(123_456);
    expect(toSen('12.')).toBe(1_200);
  });

  it('treats empty input as zero', () => {
    expect(toSen('')).toBe(0);
  });
});

it('round-trips sen through the input format', () => {
  expect(toAmountInput(1_250)).toBe('12.50');
  expect(toSen(toAmountInput(1_250))).toBe(1_250);
});

it('formats ringgit', () => {
  // Intl separates the symbol with a non-breaking space.
  expect(formatMoney(123_456)).toMatch(/^RM\s1,234\.56$/);
});
