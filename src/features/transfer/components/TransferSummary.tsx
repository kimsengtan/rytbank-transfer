import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, Text } from '@/components';
import { formatAccountNumber } from '@/lib/format';
import { formatMoney } from '@/lib/money';
import { colors, radius, spacing } from '@/theme';

import type { Recipient } from '../types';

interface TransferSummaryProps {
  recipient: Recipient;
  amount: number;
  children?: ReactNode;
}

/** Recipient and amount card shared by the review and receipt screens. */
export function TransferSummary({ recipient, amount, children }: TransferSummaryProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar name={recipient.name} size={56} />
        <Text variant="heading" align="center">
          {recipient.name}
        </Text>
        <Text variant="caption" color="textMuted">
          {formatAccountNumber(recipient.accountNumber)}
        </Text>
        <Text variant="display" style={styles.amount}>
          {formatMoney(amount)}
        </Text>
      </View>
      {children}
    </View>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="label" color="textMuted">
        {label}
      </Text>
      <Text variant="label" style={styles.value} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  header: { alignItems: 'center', gap: spacing.xs, paddingBottom: spacing.lg },
  amount: { marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  value: { flexShrink: 1, textAlign: 'right' },
});
