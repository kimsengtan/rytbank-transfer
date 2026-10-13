import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HistoryScreen } from '@/features/transfer/screens/HistoryScreen';
import { ReceiptScreen } from '@/features/transfer/screens/ReceiptScreen';
import { RecipientsScreen } from '@/features/transfer/screens/RecipientsScreen';
import { ReviewScreen } from '@/features/transfer/screens/ReviewScreen';
import { TransferScreen } from '@/features/transfer/screens/TransferScreen';
import { colors } from '@/theme';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{ headerShadowVisible: false, headerBackButtonDisplayMode: 'minimal' }}
      >
        <Stack.Screen name="Transfer" component={TransferScreen} />
        <Stack.Screen
          name="Recipients"
          component={RecipientsScreen}
          options={{ title: 'Choose recipient' }}
        />
        <Stack.Screen
          name="Review"
          component={ReviewScreen}
          options={{ title: 'Review transfer' }}
        />
        <Stack.Screen
          name="Receipt"
          component={ReceiptScreen}
          // The transfer is final at this point, so there is nothing to go back to.
          options={{
            title: 'Receipt',
            headerBackVisible: false,
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'Transfer history' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
