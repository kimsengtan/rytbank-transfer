import { randomUUID } from 'expo-crypto';
import { useState } from 'react';

import { Banner, Button, type ButtonProps, Screen } from '@/components';
import { getErrorMessage, isApiError } from '@/lib/api';
import { authenticate, useBiometricLabel } from '@/lib/biometrics';
import { formatAccountNumber } from '@/lib/format';
import { formatMoney } from '@/lib/money';
import type { ScreenProps } from '@/navigation/types';

import { PinSheet } from '../components/PinSheet';
import { DetailRow, TransferSummary } from '../components/TransferSummary';
import { useAccount, useTransfer } from '../queries';
import { useTransferDraft } from '../store';
import type { TransferAuth } from '../types';

function confirmIcon(biometricLabel?: string | null): ButtonProps['icon'] {
  if (!biometricLabel) return 'keypad-outline';
  return biometricLabel === 'Face ID' ? 'scan-outline' : 'finger-print-outline';
}

export function ReviewScreen({ navigation, route }: ScreenProps<'Review'>) {
  const { recipient, amount, note } = route.params;
  const { data: account } = useAccount();
  const biometricLabel = useBiometricLabel();
  const transfer = useTransfer();
  const resetDraft = useTransferDraft((state) => state.reset);

  // One key per review: retries after a timeout reuse it, so the backend can't double-charge.
  const [idempotencyKey] = useState(randomUUID);
  const [authorising, setAuthorising] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);

  const send = (auth: TransferAuth) =>
    transfer.mutate(
      { idempotencyKey, recipient, amount, note, auth },
      {
        onSuccess: (transaction) => {
          resetDraft();
          navigation.replace('Receipt', { transaction });
        },
        onError: (error) => {
          if (!isApiError(error, 'INVALID_PIN')) setPinVisible(false);
        },
      },
    );

  const openPin = () => {
    transfer.reset();
    setPinVisible(true);
  };

  const confirm = async () => {
    if (!biometricLabel) return openPin();

    setAuthorising(true);
    const outcome = await authenticate(`Send ${formatMoney(amount)} to ${recipient.name}`);
    setAuthorising(false);

    if (outcome === 'success') send({ method: 'biometric' });
    if (outcome === 'fallback') openPin();
  };

  const pinError = isApiError(transfer.error, 'INVALID_PIN') ? transfer.error.message : undefined;
  const failure = transfer.error && !pinError ? transfer.error : null;
  const canRetry = !failure || (isApiError(failure) && failure.isRetryable);

  return (
    <Screen
      footer={
        <Button
          title={failure ? 'Try again' : `Confirm with ${biometricLabel ?? 'PIN'}`}
          icon={confirmIcon(biometricLabel)}
          loading={authorising || (transfer.isPending && !pinVisible)}
          disabled={!canRetry}
          onPress={confirm}
        />
      }
    >
      <TransferSummary recipient={recipient} amount={amount}>
        {note ? <DetailRow label="Note" value={note} /> : null}
        {account && (
          <>
            <DetailRow
              label="From"
              value={`Savings ${formatAccountNumber(account.accountNumber)}`}
            />
            <DetailRow label="Balance after" value={formatMoney(account.balance - amount)} />
          </>
        )}
      </TransferSummary>

      {failure && (
        <Banner
          message={getErrorMessage(failure)}
          action={
            canRetry ? undefined : { label: 'Edit transfer', onPress: () => navigation.goBack() }
          }
        />
      )}

      <PinSheet
        visible={pinVisible}
        loading={transfer.isPending}
        error={pinError}
        onSubmit={(pin) => send({ method: 'pin', pin })}
        onClose={() => setPinVisible(false)}
      />
    </Screen>
  );
}
