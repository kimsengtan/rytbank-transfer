import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, type ColorName, typography, type TypographyVariant } from '@/theme';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: ColorName;
  align?: 'left' | 'center' | 'right';
}

export function Text({ variant = 'body', color = 'text', align, style, ...props }: TextProps) {
  return (
    <RNText
      style={[typography[variant], { color: colors[color], textAlign: align }, style]}
      {...props}
    />
  );
}
