import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components';
import { colors, MAX_CONTENT_WIDTH, radius, spacing } from '@/theme';

export const PIN_LENGTH = 6;

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

interface PinSheetProps {
  visible: boolean;
  loading: boolean;
  error?: string;
  onSubmit: (pin: string) => void;
  onClose: () => void;
}

/** Fallback authorisation for devices without (or with failed) biometrics. */
export function PinSheet({ visible, loading, error, onSubmit, onClose }: PinSheetProps) {
  const [pin, setPin] = useState('');
  const { bottom } = useSafeAreaInsets();
  const offset = useSharedValue(0);

  useEffect(() => {
    if (!error) return;
    const step = (x: number) => withTiming(x, { duration: 60 });
    offset.value = withSequence(step(-10), step(10), step(-6), step(6), step(0));
  }, [error, offset]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  const handleKey = (key: string) => {
    if (key === 'delete') return setPin((value) => value.slice(0, -1));

    const next = pin + key;
    if (next.length < PIN_LENGTH) return setPin(next);

    setPin('');
    onSubmit(next);
  };

  const close = () => {
    setPin('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Cancel" />

        <Animated.View
          entering={SlideInDown.duration(250)}
          style={[styles.sheet, { paddingBottom: bottom + spacing.lg }]}
        >
          <Text variant="title" align="center">
            Enter your PIN
          </Text>
          <Text color="textMuted" align="center">
            Use your 6-digit app PIN to authorise this transfer.
          </Text>

          <Animated.View
            style={[styles.dots, shakeStyle]}
            accessible
            accessibilityLabel={`${pin.length} of ${PIN_LENGTH} digits entered`}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              Array.from({ length: PIN_LENGTH }, (_, index) => (
                <View key={index} style={[styles.dot, index < pin.length && styles.dotFilled]} />
              ))
            )}
          </Animated.View>

          <Text variant="caption" color="danger" align="center" accessibilityLiveRegion="polite">
            {error ?? ' '}
          </Text>

          <View style={styles.keypad}>
            {KEYS.map((key) =>
              key ? (
                <Pressable
                  key={key}
                  onPress={() => handleKey(key)}
                  disabled={loading}
                  style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={key === 'delete' ? 'Delete' : key}
                >
                  {key === 'delete' ? (
                    <Ionicons name="backspace-outline" size={26} color={colors.text} />
                  ) : (
                    <Text variant="title">{key}</Text>
                  )}
                </Pressable>
              ) : (
                <View key="spacer" style={styles.key} />
              ),
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  dots: {
    height: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dotFilled: { backgroundColor: colors.primary },
  keypad: { flexDirection: 'row', flexWrap: 'wrap' },
  key: {
    width: '33.33%',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  keyPressed: { backgroundColor: colors.background },
});
