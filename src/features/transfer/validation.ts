import { formatMoney, toSen } from '@/lib/money';

import type { Recipient } from './types';

export const MIN_AMOUNT = 1_00;
export const MAX_AMOUNT = 10_000_00;
export const NOTE_MAX_LENGTH = 60;

export interface TransferDraft {
  recipient: Recipient | null;
  /** Raw amount as typed, e.g. "12.50". */
  amount: string;
  note: string;
}

export type TransferErrors = Partial<Record<keyof TransferDraft, string>>;

/** The balance check is skipped until the balance is known. */
export function validateAmount(amount: number, balance?: number): string | undefined {
  if (amount <= 0) return 'Enter an amount';
  if (amount < MIN_AMOUNT) return `The minimum transfer is ${formatMoney(MIN_AMOUNT)}`;
  if (amount > MAX_AMOUNT) return `The maximum per transfer is ${formatMoney(MAX_AMOUNT)}`;
  if (balance !== undefined && amount > balance) return 'Amount exceeds your available balance';
  return undefined;
}

export function validateTransfer(draft: TransferDraft, balance?: number): TransferErrors {
  const errors: TransferErrors = {};

  if (!draft.recipient) errors.recipient = 'Choose who you want to pay';

  const amountError = validateAmount(toSen(draft.amount), balance);
  if (amountError) errors.amount = amountError;

  if (draft.note.length > NOTE_MAX_LENGTH) {
    errors.note = `Keep the note under ${NOTE_MAX_LENGTH} characters`;
  }

  return errors;
}

/** Account numbers and Malaysian mobile numbers are both 10-16 digits. */
export const isValidAccountNumber = (value: string) => /^\d{10,16}$/.test(value);
