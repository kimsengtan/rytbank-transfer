import { useNavigation } from '@react-navigation/native';
import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, Text } from '@/components';
import { spacing } from '@/theme';

import { useRecentRecipients } from '../queries';
import { useTransferDraft } from '../store';

/** One-tap selection of people paid recently. */
export const RecentRecipients = memo(function RecentRecipients() {
  const navigation = useNavigation();
  const { data: recipients = [] } = useRecentRecipients();
  const setRecipient = useTransferDraft((state) => state.setRecipient);

  if (recipients.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="label" color="textMuted">
          Recent
        </Text>
        <Pressable
          onPress={() => navigation.navigate('History')}
          hitSlop={12}
          accessibilityRole="link"
        >
          <Text variant="label" color="primary">
            See history
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {recipients.map((recipient) => (
          <Pressable
            key={recipient.accountNumber}
            onPress={() => setRecipient(recipient)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Pay ${recipient.name}`}
          >
            <Avatar name={recipient.name} size={52} />
            <Text variant="caption" numberOfLines={1} align="center">
              {recipient.name.split(' ')[0]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  list: { gap: spacing.lg },
  item: { width: 60, alignItems: 'center', gap: spacing.xs },
  pressed: { opacity: 0.6 },
});
