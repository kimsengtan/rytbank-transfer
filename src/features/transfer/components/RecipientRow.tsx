import { memo } from 'react';

import { Avatar, ListItem } from '@/components';
import { formatAccountNumber } from '@/lib/format';

import type { Recipient } from '../types';

interface RecipientRowProps {
  recipient: Recipient;
  onPress: (recipient: Recipient) => void;
}

export const RecipientRow = memo(function RecipientRow({ recipient, onPress }: RecipientRowProps) {
  return (
    <ListItem
      title={recipient.name}
      subtitle={formatAccountNumber(recipient.accountNumber)}
      leading={<Avatar name={recipient.name} />}
      onPress={() => onPress(recipient)}
      accessibilityLabel={`Pay ${recipient.name}`}
    />
  );
});
