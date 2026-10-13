import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    // Money movement is never retried automatically; the user decides.
    mutations: { retry: false },
  },
});

// Refetch stale data (balance, contacts permission) when the app returns to the foreground.
if (Platform.OS !== 'web') {
  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener('change', (state) =>
      setFocused(state === 'active'),
    );
    return () => subscription.remove();
  });
}
