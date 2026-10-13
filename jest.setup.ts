import { setUpTests } from 'react-native-reanimated';

setUpTests();

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

// The new expo-contacts API extends a native class at import time, which jest-expo doesn't mock.
jest.mock('expo-contacts', () => ({
  Contact: { getAllDetails: jest.fn(async () => []) },
  ContactField: { FULL_NAME: 'fullName', PHONES: 'phones' },
  ContactsSortOrder: { GivenName: 'givenName' },
  requestPermissionsAsync: jest.fn(async () => ({ granted: false })),
}));

// Idempotency keys must be unique per review, as they are on device.
jest.mock('expo-crypto', () => ({ randomUUID: () => require('crypto').randomUUID() }));
