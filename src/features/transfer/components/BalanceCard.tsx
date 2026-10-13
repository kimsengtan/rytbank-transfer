import { Ionicons } from '@expo/vector-icons';
import { memo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Banner, Text } from '@/components';
import { formatAccountNumber } from '@/lib/format';
import { formatMoney } from '@/lib/money';
import { colors, radius, spacing } from '@/theme';

import { useAccount } from '../queries';

export const BalanceCard = memo(function BalanceCard() {
  const { data: account, isError, refetch } = useAccount();
  const [hidden, setHidden] = useState(false);

  if (isError) {
    return (
      <Banner
        message="We couldn't load your balance."
        action={{ label: 'Try again', onPress: () => refetch() }}
      />
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text variant="label" color="textInverseMuted">
          Available balance
        </Text>
        <Pressable
          onPress={() => setHidden((value) => !value)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}
        >
          <Ionicons
            name={hidden ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textInverse}
          />
        </Pressable>
      </View>

      {account ? (
        <Text variant="display" color="textInverse" accessibilityLiveRegion="polite">
          {hidden ? 'RM ••••••' : formatMoney(account.balance)}
        </Text>
      ) : (
        <ActivityIndicator color={colors.textInverse} style={styles.loader} />
      )}

      <Text variant="caption" color="textInverseMuted">
        Savings {account ? formatAccountNumber(account.accountNumber) : ''}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loader: { alignSelf: 'flex-start', height: 38 },
});
