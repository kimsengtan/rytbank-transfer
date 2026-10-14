import { ApiError } from '@/lib/api';

import { getAccount, getTransactions, lookupRecipient, submitTransfer } from './api';
import { MOCK_PIN, PAYEES } from './mockData';
import type { TransferRequest } from './types';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  delay: () => Promise.resolve(),
}));

let requestCount = 0;

const request = (overrides: Partial<TransferRequest> = {}): TransferRequest => ({
  idempotencyKey: `key-${++requestCount}`,
  recipient: PAYEES[0],
  amount: 10_00,
  auth: { method: 'biometric' },
  ...overrides,
});

describe('submitTransfer', () => {
  it('debits the balance and adds the transfer to the history', async () => {
    const { balance } = await getAccount();

    const transaction = await submitTransfer(request({ amount: 25_50, note: 'Lunch' }));

    expect(transaction).toMatchObject({ amount: 25_50, note: 'Lunch', recipient: PAYEES[0] });
    expect((await getAccount()).balance).toBe(balance - 25_50);
    expect((await getTransactions())[0]).toBe(transaction);
  });

  it('applies a repeated request only once', async () => {
    const { balance } = await getAccount();
    const repeated = request();

    const first = await submitTransfer(repeated);
    const second = await submitTransfer(repeated);

    expect(second).toBe(first);
    expect((await getAccount()).balance).toBe(balance - repeated.amount);
  });

  it('authorises with the correct PIN only', async () => {
    await expect(
      submitTransfer(request({ auth: { method: 'pin', pin: '000000' } })),
    ).rejects.toMatchObject({ code: 'INVALID_PIN' });

    await expect(
      submitTransfer(request({ auth: { method: 'pin', pin: MOCK_PIN } })),
    ).resolves.toBeDefined();
  });

  it('locks the PIN after three incorrect attempts', async () => {
    // A fresh backend, so the lock doesn't leak into other tests.
    let backend!: typeof import('./api');
    jest.isolateModules(() => {
      backend = jest.requireActual('./api');
    });
    const withPin = (pin: string) =>
      backend.submitTransfer(request({ auth: { method: 'pin', pin } }));

    await expect(withPin('000000')).rejects.toMatchObject({ code: 'INVALID_PIN' });
    await expect(withPin('000000')).rejects.toMatchObject({ code: 'INVALID_PIN' });
    await expect(withPin('000000')).rejects.toMatchObject({ code: 'PIN_LOCKED' });
    await expect(withPin(MOCK_PIN)).rejects.toMatchObject({ code: 'PIN_LOCKED' });
  });

  it('rejects transfers above the available balance', async () => {
    const { balance } = await getAccount();

    await expect(submitTransfer(request({ amount: balance + 1 }))).rejects.toMatchObject({
      code: 'INSUFFICIENT_FUNDS',
    });
  });

  it('recovers from a dropped connection when the same request is retried', async () => {
    const flaky = request({ amount: 4_04 });

    const error = await submitTransfer(flaky).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'NETWORK_ERROR', isRetryable: true });
    await expect(submitTransfer(flaky)).resolves.toMatchObject({ amount: 4_04 });
  });
});

describe('lookupRecipient', () => {
  it('returns the registered name for a known account', async () => {
    await expect(lookupRecipient(PAYEES[0].accountNumber)).resolves.toEqual(PAYEES[0]);
  });

  it('fails for accounts that do not exist', async () => {
    await expect(lookupRecipient('1234560000')).rejects.toMatchObject({
      code: 'ACCOUNT_NOT_FOUND',
    });
  });
});
