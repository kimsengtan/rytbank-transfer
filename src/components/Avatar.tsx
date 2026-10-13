import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

import { Text } from './Text';

const PALETTE = ['#6E56CF', '#0B7BD4', '#0E9384', '#D9480F', '#C11574', '#3E63DD', '#2F855A'];

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter((word) => /^[a-z]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

const pickColor = (name: string) => {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

interface AvatarProps {
  name: string;
  size?: number;
}

export const Avatar = memo(function Avatar({ name, size = 44 }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <View
      accessible={false}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: pickColor(name) },
      ]}
    >
      {initials ? (
        <Text color="textInverse" style={[styles.initials, { fontSize: size * 0.38 }]}>
          {initials}
        </Text>
      ) : (
        <Ionicons name="person" size={size * 0.5} color={colors.textInverse} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '600' },
});
