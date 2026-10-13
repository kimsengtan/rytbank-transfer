import {
  isValidAccountNumber,
  NOTE_MAX_LENGTH,
  type TransferDraft,
  validateTransfer,
} from './validation';

const draft = (overrides: Partial<TransferDraft> = {}): TransferDraft => ({
  recipient: { name: 'Daniel Tan', accountNumber: '164002123456' },
  amount: '50',
  note: '',
  ...overrides,
});

const BALANCE = 100_00;

describe('validateTransfer', () => {
  it('accepts a complete transfer within the balance', () => {
    expect(validateTransfer(draft(), BALANCE)).toEqual({});
  });

  it('requires a recipient and an amount', () => {
    expect(validateTransfer(draft({ recipient: null, amount: '' }), BALANCE)).toEqual({
      recipient: 'Choose who you want to pay',
      amount: 'Enter an amount',
    });
  });

  it.each([
    ['0.50', /minimum transfer is RM\s1\.00/],
    ['10000.01', /maximum per transfer is RM\s10,000\.00/],
    ['100.01', /exceeds your available balance/],
  ])('rejects RM %s', (amount, message) => {
    expect(validateTransfer(draft({ amount }), BALANCE).amount).toMatch(message);
  });

  it('allows sending the exact balance', () => {
    expect(validateTransfer(draft({ amount: '100' }), BALANCE)).toEqual({});
  });

  it('skips the balance check until the balance is known', () => {
    expect(validateTransfer(draft({ amount: '9000' }))).toEqual({});
  });

  it('limits the note length', () => {
    const note = 'x'.repeat(NOTE_MAX_LENGTH + 1);
    expect(validateTransfer(draft({ note }), BALANCE).note).toBeDefined();
  });
});

describe('isValidAccountNumber', () => {
  it.each(['0123456789', '164002123456', '1234567890123456'])('accepts %s', (value) => {
    expect(isValidAccountNumber(value)).toBe(true);
  });

  it.each(['012345678', '12345678901234567', '01234abcde', ''])('rejects %p', (value) => {
    expect(isValidAccountNumber(value)).toBe(false);
  });
});
