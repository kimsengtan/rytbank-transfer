import { Ionicons } from '@expo/vector-icons';
import { Share, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Button, Screen, Text } from '@/components';
import { formatDateTime } from '@/lib/format';
import { formatMoney } from '@/lib/money';
import type { ScreenProps } from '@/navigation/types';
import { colors, radius, spacing } from '@/theme';

import { DetailRow, TransferSummary } from '../components/TransferSummary';

export function ReceiptScreen({ navigation, route }: ScreenProps<'Receipt'>) {
  const { recipient, amount, reference, note, createdAt } = route.params.transaction;
  const date = formatDateTime(createdAt);

  const share = () =>
    Share.share({
      message: `Transferred ${formatMoney(amount)} to ${recipient.name} on ${date}. Reference: ${reference}`,
    }).catch(() => undefined);

  return (
    <Screen
      footer={
        <>
          <Button title="Done" onPress={() => navigation.popTo('Transfer')} />
          <Button title="Share receipt" variant="ghost" icon="share-outline" onPress={share} />
        </>
      }
    >
      <View style={styles.status}>
        <Animated.View entering={ZoomIn.springify().delay(100)} style={styles.badge}>
          <Ionicons name="checkmark" size={44} color={colors.textInverse} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(250)} style={styles.message}>
          <Text variant="title" align="center" accessibilityRole="header">
            Transfer successful
          </Text>
          <Text color="textMuted" align="center">
            Your money is on its way to {recipient.name}.
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(350)}>
        <TransferSummary recipient={recipient} amount={amount}>
          <DetailRow label="Reference" value={reference} />
          <DetailRow label="Date" value={date} />
          {note ? <DetailRow label="Note" value={note} /> : null}
        </TransferSummary>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  status: { alignItems: 'center', gap: spacing.lg, paddingTop: spacing.lg },
  badge: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: { gap: spacing.xs },
});
