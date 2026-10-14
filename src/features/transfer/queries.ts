import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAccount, getTransactions, lookupRecipient, submitTransfer } from './api';
import type { Recipient, Transaction } from './types';
import { isValidAccountNumber } from './validation';

const keys = {
  account: ['account'] as const,
  transactions: ['account', 'transactions'] as const,
};

export const useAccount = () => useQuery({ queryKey: keys.account, queryFn: getAccount });

export const useTransactions = () =>
  useQuery({ queryKey: keys.transactions, queryFn: getTransactions });

const RECENT_LIMIT = 8;

export function uniqueRecipients(recipients: Recipient[]) {
  const seen = new Set<string>();
  return recipients.filter(({ accountNumber }) => {
    if (seen.has(accountNumber)) return false;
    seen.add(accountNumber);
    return true;
  });
}

const selectRecentRecipients = (transactions: Transaction[]) =>
  uniqueRecipients(transactions.map((transaction) => transaction.recipient)).slice(0, RECENT_LIMIT);

/** The last few distinct people paid, derived from the cached transaction history. */
export const useRecentRecipients = () =>
  useQuery({
    queryKey: keys.transactions,
    queryFn: getTransactions,
    select: selectRecentRecipients,
  });

export const useRecipientLookup = (accountNumber: string) =>
  useQuery({
    queryKey: ['recipient', accountNumber],
    queryFn: () => lookupRecipient(accountNumber),
    enabled: isValidAccountNumber(accountNumber),
    staleTime: Infinity,
    retry: false,
  });

export function useTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitTransfer,
    // The request can carry the PIN, so it shouldn't outlive the review screen in the cache.
    gcTime: 0,
    // Refreshes the balance and the history in one go.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.account }),
  });
}
