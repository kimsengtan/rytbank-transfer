import type { Account, Recipient, Transaction } from './types';

export const MOCK_PIN = '123456';

export const MOCK_ACCOUNT: Account = {
  holderName: 'Aina Rahman',
  accountNumber: '880123456789',
  balance: 8_450_75,
};

export const PAYEES: Recipient[] = [
  { name: 'Daniel Tan', accountNumber: '164002123456' },
  { name: 'Nur Aisyah', accountNumber: '0123456789' },
  { name: 'Arjun Kumar', accountNumber: '514022987654' },
  { name: 'Mei Ling Wong', accountNumber: '0172233445' },
  { name: 'Hafiz Ismail', accountNumber: '701234567890' },
  { name: 'Priya Nair', accountNumber: '0198765432' },
  { name: 'Jason Lim', accountNumber: '330112233445' },
  { name: 'Farah Aziz', accountNumber: '0136677889' },
  { name: 'Kevin Ong', accountNumber: '812300445566' },
  { name: 'Siti Hajar', accountNumber: '0164455667' },
];

/** Names returned by the mock name enquiry for account numbers we don't already know. */
export const REGISTERED_NAMES = [
  'Ahmad Faizal',
  'Chloe Ng',
  'Ravi Shankar',
  'Nurul Izzah',
  'Marcus Teh',
  'Kavitha Raj',
];

const NOTES = ['Lunch', '', 'Rent share', 'Groceries', '', 'Movie tickets', 'Badminton court', ''];

const HOUR = 60 * 60 * 1000;

/**
 * A deterministic, reasonably large history so list rendering can be checked with
 * realistic volume rather than a handful of rows.
 */
export function createTransactionHistory(count = 300, now = Date.now()): Transaction[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `seed-${index}`,
    reference: `RYT${String(9_000_000 - index).padStart(10, '0')}`,
    recipient: PAYEES[(index * 7) % PAYEES.length],
    amount: ((index * 2_654_435_761) % 45_000) + 5_00,
    note: NOTES[index % NOTES.length] || undefined,
    createdAt: new Date(now - (index + 1) * 9 * HOUR).toISOString(),
  }));
}
