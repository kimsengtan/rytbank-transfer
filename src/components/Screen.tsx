import { useHeaderHeight } from '@react-navigation/elements';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, MAX_CONTENT_WIDTH, spacing } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  /** Pinned below the scrollable content and kept above the keyboard. */
  footer?: ReactNode;
  /** Set to false for screens that render their own virtualised list. */
  scrollable?: boolean;
}

/**
 * Standard screen layout: scrollable content, an optional sticky footer for primary
 * actions, keyboard avoidance and a max content width for tablets and web.
 */
export function Screen({ children, footer, scrollable = true }: ScreenProps) {
  const headerHeight = useHeaderHeight();
  const { bottom } = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      {scrollable ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={styles.content}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fixed]}>{children}</View>
      )}
      {footer && (
        <View style={[styles.footer, { paddingBottom: Math.max(bottom, spacing.lg) }]}>
          <View style={[styles.content, styles.footerContent]}>{footer}</View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg },
  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: spacing.xl,
  },
  fixed: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerContent: { gap: spacing.xs },
});
