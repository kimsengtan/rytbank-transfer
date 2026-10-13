import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { FormField, type FormFieldProps } from './FormField';
import { Text } from './Text';

export interface TextFieldProps extends TextInputProps, FormFieldProps {
  prefix?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
}

export function TextField({
  label,
  error,
  hint,
  prefix,
  icon,
  style,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <FormField label={label} error={error} hint={hint}>
      <View
        style={[fieldStyles.box, focused && fieldStyles.focused, !!error && fieldStyles.invalid]}
      >
        {icon && <Ionicons name={icon} size={20} color={colors.textMuted} />}
        {!!prefix && (
          <Text variant="heading" color="textMuted">
            {prefix}
          </Text>
        )}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          {...inputProps}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, style]}
        />
      </View>
    </FormField>
  );
}

export const fieldStyles = StyleSheet.create({
  box: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  focused: { borderColor: colors.primary },
  invalid: { borderColor: colors.danger },
});

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    flex: 1,
    alignSelf: 'stretch',
    color: colors.text,
    paddingVertical: spacing.md,
    // The field border already shows focus; this drops the extra browser ring on web.
    outlineWidth: 0,
  },
});
