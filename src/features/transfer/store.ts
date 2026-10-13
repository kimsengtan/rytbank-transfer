import { create } from 'zustand';

import { sanitizeAmount } from '@/lib/money';

import type { Recipient } from './types';
import type { TransferDraft } from './validation';

interface DraftState extends TransferDraft {
  /** Set by the first Continue, after which every field shows its errors. */
  submitted: boolean;
  setRecipient: (recipient: Recipient) => void;
  setAmount: (amount: string) => void;
  setNote: (note: string) => void;
  submit: () => void;
  /** Replaces the whole draft, used for "send again". */
  prefill: (draft: Partial<TransferDraft>) => void;
  reset: () => void;
}

const initialState = { recipient: null, amount: '', note: '', submitted: false };

/**
 * The transfer being composed. It's shared by the form, the recipient picker and the
 * history screen, and components subscribe to individual fields to limit re-renders.
 */
export const useTransferDraft = create<DraftState>()((set) => ({
  ...initialState,
  setRecipient: (recipient) => set({ recipient }),
  setAmount: (amount) => set({ amount: sanitizeAmount(amount) }),
  setNote: (note) => set({ note }),
  submit: () => set({ submitted: true }),
  prefill: (draft) => set({ ...initialState, ...draft }),
  reset: () => set(initialState),
}));
