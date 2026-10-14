import { randomUUID } from 'expo-crypto';

import { ApiError, delay } from '@/lib/api';

import {
  createTransactionHistory,
  MOCK_ACCOUNT,
  MOCK_PIN,
  PAYEES,
  REGISTERED_NAMES,
} from './mockData';
import type { Account, Recipient, Transaction, TransferRequest } from './types';
import { MAX_AMOUNT } from './validation';

/**
 * In-memory stand-in for the banking backend. Every call goes through a simulated
 * network delay so loading and error states behave as they would against a real API.
 */
const server = {
  account: { ...MOCK_ACCOUNT },
  transactions: createTransactionHistory(),
  completed: new Map<string, Transaction>(),
  failedOnce: new Set<string>(),
  failedPinAttempts: 0,
};

const MAX_PIN_ATTEMPTS = 3;

/** Account numbers ending in 0000 don't exist, so the "not found" path can be demoed. */
const UNKNOWN_ACCOUNT_SUFFIX = '0000';

/**
 * Amounts that trigger failure paths so they can be demoed deterministically:
 * RM 4.04 loses the connection on the first attempt (retrying succeeds),
 * RM 5.03 is rejected because the service is unavailable.
 */
const FLAKY_AMOUNT = 4_04;
const UNAVAILABLE_AMOUNT = 5_03;

export async function getAccount(): Promise<Account> {
  await delay(500);
  return { ...server.account };
}

/** Newest first. */
export async function getTransactions(): Promise<Transaction[]> {
  await delay(500);
  return server.transactions;
}

/**
 * DuitNow-style name enquiry: resolves the registered name behind an account or mobile
 * number so the payer can check who they are paying before any money moves.
 */
export async function lookupRecipient(accountNumber: string): Promise<Recipient> {
  await delay(600);
  if (accountNumber.endsWith(UNKNOWN_ACCOUNT_SUFFIX)) throw new ApiError('ACCOUNT_NOT_FOUND');

  const known = PAYEES.find((payee) => payee.accountNumber === accountNumber);
  if (known) return known;

  const checksum = [...accountNumber].reduce((sum, digit) => sum + Number(digit), 0);
  return { accountNumber, name: REGISTERED_NAMES[checksum % REGISTERED_NAMES.length] };
}

/** Locks the PIN after repeated failures so it can't be guessed. */
function verifyPin(pin: string) {
  if (server.failedPinAttempts >= MAX_PIN_ATTEMPTS) throw new ApiError('PIN_LOCKED');

  if (pin !== MOCK_PIN) {
    server.failedPinAttempts += 1;
    throw new ApiError(server.failedPinAttempts >= MAX_PIN_ATTEMPTS ? 'PIN_LOCKED' : 'INVALID_PIN');
  }
  server.failedPinAttempts = 0;
}

export async function submitTransfer(request: TransferRequest): Promise<Transaction> {
  await delay(1200);

  const previous = server.completed.get(request.idempotencyKey);
  if (previous) return previous;

  if (request.auth.method === 'pin') verifyPin(request.auth.pin);
  if (request.amount === FLAKY_AMOUNT && !server.failedOnce.has(request.idempotencyKey)) {
    server.failedOnce.add(request.idempotencyKey);
    throw new ApiError('NETWORK_ERROR');
  }
  if (request.amount === UNAVAILABLE_AMOUNT) throw new ApiError('SERVICE_UNAVAILABLE');
  if (request.amount > MAX_AMOUNT) throw new ApiError('LIMIT_EXCEEDED');
  if (request.amount > server.account.balance) throw new ApiError('INSUFFICIENT_FUNDS');

  const transaction: Transaction = {
    id: randomUUID(),
    reference: `RYT${Date.now().toString().slice(-10)}`,
    recipient: request.recipient,
    amount: request.amount,
    note: request.note,
    createdAt: new Date().toISOString(),
  };

  server.account.balance -= request.amount;
  server.transactions = [transaction, ...server.transactions];
  server.completed.set(request.idempotencyKey, transaction);

  return transaction;
}
