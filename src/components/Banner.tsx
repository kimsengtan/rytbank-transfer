import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

interface BannerProps {
  message: string;
  action?: { label: string; onPress: () => void };
}

/** Inline error with an optional recovery action, e.g. "Try again". */
export function Banner({ message, action }: BannerProps) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <View style={styles.message}>
        <Ionicons name="alert-circle" size={20} color={colors.danger} />
        <Text variant="label" style={styles.text}>
          {message}
        </Text>
      </View>
      {action && (
        <Button
          title={action.label}
          variant="ghost"
          onPress={action.onPress}
          style={styles.action}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  message: { flexDirection: 'row', gap: spacing.sm },
  text: { flex: 1 },
  action: { alignSelf: 'flex-start', minHeight: 36, paddingHorizontal: 0 },
});
