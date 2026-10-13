/** All amounts are in sen (RM 1.00 = 100). */

export interface Recipient {
  name: string;
  /** Bank account or DuitNow mobile number, digits only. */
  accountNumber: string;
}

export interface Account {
  holderName: string;
  accountNumber: string;
  balance: number;
}

export interface Transaction {
  id: string;
  reference: string;
  recipient: Recipient;
  amount: number;
  note?: string;
  createdAt: string;
}

export type TransferAuth = { method: 'biometric' } | { method: 'pin'; pin: string };

export interface TransferRequest {
  /** Generated once per review so a retried request can never be applied twice. */
  idempotencyKey: string;
  recipient: Recipient;
  amount: number;
  note?: string;
  auth: TransferAuth;
}
