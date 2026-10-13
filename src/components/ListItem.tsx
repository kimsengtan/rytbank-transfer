import type { ReactNode } from 'react';
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/theme';

import { Text } from './Text';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  style,
  ...a11y
}: ListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      {...a11y}
      style={({ pressed }) => [styles.row, style, pressed && styles.pressed]}
    >
      {leading}
      <View style={styles.body}>
        <Text variant="heading" numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
    </Pressable>
  );
}

export const ListSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: { opacity: 0.6 },
  body: { flex: 1, gap: 2 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
