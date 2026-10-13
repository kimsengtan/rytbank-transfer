import { Ionicons } from '@expo/vector-icons';

import { Avatar, fieldStyles, FormField, ListItem } from '@/components';
import { formatAccountNumber } from '@/lib/format';
import { colors } from '@/theme';

import type { Recipient } from '../types';

interface RecipientFieldProps {
  recipient: Recipient | null;
  error?: string;
  onPress: () => void;
}

export function RecipientField({ recipient, error, onPress }: RecipientFieldProps) {
  return (
    <FormField label="To" error={error}>
      <ListItem
        title={recipient?.name ?? 'Choose recipient'}
        subtitle={
          recipient ? formatAccountNumber(recipient.accountNumber) : 'Contacts or account number'
        }
        leading={
          recipient ? (
            <Avatar name={recipient.name} size={40} />
          ) : (
            <Ionicons name="person-add-outline" size={24} color={colors.primary} />
          )
        }
        trailing={<Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
        onPress={onPress}
        accessibilityLabel={recipient ? `Paying ${recipient.name}` : 'Choose recipient'}
        accessibilityHint="Opens the recipient list"
        style={[fieldStyles.box, !!error && fieldStyles.invalid]}
      />
    </FormField>
  );
}
