import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { Text } from './Text';

export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
}

/** Label, control and a single line of feedback. Errors take priority over hints. */
export function FormField({
  label,
  error,
  hint,
  children,
}: FormFieldProps & { children: ReactNode }) {
  const message = error ?? hint;

  return (
    <View style={styles.container}>
      {!!label && (
        <Text variant="label" color="textMuted">
          {label}
        </Text>
      )}
      {children}
      {!!message && (
        <Text
          variant="caption"
          color={error ? 'danger' : 'textMuted'}
          accessibilityLiveRegion={error ? 'polite' : 'none'}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
});
