import {
  authenticateAsync,
  AuthenticationType,
  getEnrolledLevelAsync,
  SecurityLevel,
  supportedAuthenticationTypesAsync,
} from 'expo-local-authentication';

import { authenticate, getBiometricLabel } from './biometrics';

jest.mock('expo-local-authentication', () => ({
  ...jest.requireActual('expo-local-authentication'),
  authenticateAsync: jest.fn(),
  getEnrolledLevelAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
}));

const mockAuthenticate = jest.mocked(authenticateAsync);
const mockLevel = jest.mocked(getEnrolledLevelAsync);
const mockTypes = jest.mocked(supportedAuthenticationTypesAsync);

describe('getBiometricLabel (iOS)', () => {
  it('names Face ID and Touch ID', async () => {
    mockLevel.mockResolvedValue(SecurityLevel.BIOMETRIC_STRONG);

    mockTypes.mockResolvedValue([AuthenticationType.FACIAL_RECOGNITION]);
    await expect(getBiometricLabel()).resolves.toBe('Face ID');

    mockTypes.mockResolvedValue([AuthenticationType.FINGERPRINT]);
    await expect(getBiometricLabel()).resolves.toBe('Touch ID');
  });

  it('returns null when only a passcode is enrolled', async () => {
    mockLevel.mockResolvedValue(SecurityLevel.SECRET);
    mockTypes.mockResolvedValue([AuthenticationType.FACIAL_RECOGNITION]);

    await expect(getBiometricLabel()).resolves.toBeNull();
  });
});

describe('authenticate', () => {
  it('never falls back to the device passcode', async () => {
    mockAuthenticate.mockResolvedValue({ success: true });

    await expect(authenticate('Confirm')).resolves.toBe('success');
    expect(mockAuthenticate).toHaveBeenCalledWith(
      expect.objectContaining({ disableDeviceFallback: true }),
    );
  });

  it.each(['user_cancel', 'system_cancel', 'app_cancel'] as const)(
    'treats %s as a cancellation',
    async (error) => {
      mockAuthenticate.mockResolvedValue({ success: false, error });
      await expect(authenticate('Confirm')).resolves.toBe('cancelled');
    },
  );

  it.each(['user_fallback', 'lockout', 'not_enrolled', 'authentication_failed'] as const)(
    'asks for the PIN after %s',
    async (error) => {
      mockAuthenticate.mockResolvedValue({ success: false, error });
      await expect(authenticate('Confirm')).resolves.toBe('fallback');
    },
  );

  it('asks for the PIN if the prompt itself fails', async () => {
    mockAuthenticate.mockRejectedValue(new Error('Native module unavailable'));
    await expect(authenticate('Confirm')).resolves.toBe('fallback');
  });
});
