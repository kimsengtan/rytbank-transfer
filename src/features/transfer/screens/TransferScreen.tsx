import { StyleSheet } from 'react-native';

import { Button, Screen, TextField } from '@/components';
import { formatMoney, toSen } from '@/lib/money';
import type { ScreenProps } from '@/navigation/types';
import { typography } from '@/theme';

import { BalanceCard } from '../components/BalanceCard';
import { RecentRecipients } from '../components/RecentRecipients';
import { RecipientField } from '../components/RecipientField';
import { useAccount } from '../queries';
import { useTransferDraft } from '../store';
import { MAX_AMOUNT, NOTE_MAX_LENGTH, validateTransfer } from '../validation';

export function TransferScreen({ navigation }: ScreenProps<'Transfer'>) {
  const { recipient, amount, note, submitted, setAmount, setNote, submit } = useTransferDraft();
  const { data: account } = useAccount();

  const errors = validateTransfer({ recipient, amount, note }, account?.balance);
  // Amount feedback is live once the user starts typing; the rest waits for the first submit.
  const visibleErrors = submitted ? errors : { amount: amount ? errors.amount : undefined };

  const handleContinue = () => {
    submit();
    if (!recipient || Object.keys(errors).length > 0) return;

    navigation.navigate('Review', {
      recipient,
      amount: toSen(amount),
      note: note.trim() || undefined,
    });
  };

  return (
    <Screen footer={<Button title="Continue" onPress={handleContinue} disabled={!account} />}>
      <BalanceCard />
      <RecentRecipients />
      <RecipientField
        recipient={recipient}
        error={visibleErrors.recipient}
        onPress={() => navigation.navigate('Recipients')}
      />
      <TextField
        label="Amount"
        prefix="RM"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="decimal-pad"
        error={visibleErrors.amount}
        hint={`Up to ${formatMoney(MAX_AMOUNT)} per transfer`}
        style={styles.amount}
      />
      <TextField
        label="Note (optional)"
        value={note}
        onChangeText={setNote}
        placeholder="What's it for?"
        maxLength={NOTE_MAX_LENGTH}
        error={visibleErrors.note}
        hint={`${note.length}/${NOTE_MAX_LENGTH}`}
        returnKeyType="done"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  amount: typography.title,
});
