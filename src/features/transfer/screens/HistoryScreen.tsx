import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner, ListSeparator, Screen, Text } from '@/components';
import { toAmountInput } from '@/lib/money';
import type { ScreenProps } from '@/navigation/types';
import { spacing } from '@/theme';

import { TransactionRow } from '../components/TransactionRow';
import { useTransactions } from '../queries';
import { useTransferDraft } from '../store';
import type { Transaction } from '../types';

const keyExtractor = (transaction: Transaction) => transaction.id;

export function HistoryScreen({ navigation }: ScreenProps<'History'>) {
  const { data, isPending, isError, isRefetching, refetch } = useTransactions();
  const prefill = useTransferDraft((state) => state.prefill);
  const { bottom } = useSafeAreaInsets();

  const sendAgain = useCallback(
    ({ recipient, amount, note = '' }: Transaction) => {
      prefill({ recipient, amount: toAmountInput(amount), note });
      navigation.popTo('Transfer');
    },
    [navigation, prefill],
  );

  const renderItem = useCallback<ListRenderItem<Transaction>>(
    ({ item }) => <TransactionRow transaction={item} onPress={sendAgain} />,
    [sendAgain],
  );

  if (isError) {
    return (
      <Screen>
        <Banner
          message="We couldn't load your transfers."
          action={{ label: 'Try again', onPress: () => refetch() }}
        />
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={
          <Text variant="caption" color="textMuted" style={styles.hint}>
            Tap a transfer to send it again.
          </Text>
        }
        ListEmptyComponent={
          isPending ? (
            <ActivityIndicator />
          ) : (
            <Text color="textMuted" align="center">
              No transfers yet.
            </Text>
          )
        }
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={{ paddingBottom: bottom }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { paddingBottom: spacing.sm },
});
