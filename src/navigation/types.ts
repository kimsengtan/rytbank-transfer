import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Recipient, Transaction } from '@/features/transfer/types';

export type RootStackParamList = {
  Transfer: undefined;
  Recipients: undefined;
  /** A snapshot of the draft, so later edits to the form can't change what is being confirmed. */
  Review: { recipient: Recipient; amount: number; note?: string };
  Receipt: { transaction: Transaction };
  History: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
