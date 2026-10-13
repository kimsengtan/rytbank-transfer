import { memo } from 'react';

import { Avatar, ListItem, Text } from '@/components';
import { formatDateTime } from '@/lib/format';
import { formatMoney } from '@/lib/money';

import type { Transaction } from '../types';

interface TransactionRowProps {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
}

export const TransactionRow = memo(function TransactionRow({
  transaction,
  onPress,
}: TransactionRowProps) {
  const { recipient, amount, note, createdAt } = transaction;
  const date = formatDateTime(createdAt);

  return (
    <ListItem
      title={recipient.name}
      subtitle={note ? `${date} · ${note}` : date}
      leading={<Avatar name={recipient.name} />}
      trailing={<Text variant="heading">-{formatMoney(amount)}</Text>}
      onPress={() => onPress(transaction)}
      accessibilityLabel={`${formatMoney(amount)} to ${recipient.name} on ${date}`}
      accessibilityHint="Starts a new transfer with the same details"
    />
  );
});
