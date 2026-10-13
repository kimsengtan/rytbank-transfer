import { useQuery } from '@tanstack/react-query';
import {
  authenticateAsync,
  AuthenticationType,
  getEnrolledLevelAsync,
  SecurityLevel,
  supportedAuthenticationTypesAsync,
} from 'expo-local-authentication';
import { Platform } from 'react-native';

export type AuthOutcome = 'success' | 'cancelled' | 'fallback';

/**
 * Returns the name of the enrolled biometric (e.g. "Face ID"), or null when the device
 * has no strong biometric enrolled and the PIN fallback should be used instead.
 */
export async function getBiometricLabel(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const [level, types] = await Promise.all([
    getEnrolledLevelAsync(),
    supportedAuthenticationTypesAsync(),
  ]);
  if (level !== SecurityLevel.BIOMETRIC_STRONG) return null;

  if (Platform.OS === 'ios') {
    return types.includes(AuthenticationType.FACIAL_RECOGNITION) ? 'Face ID' : 'Touch ID';
  }
  return types.length === 1 && types[0] === AuthenticationType.FINGERPRINT
    ? 'Fingerprint'
    : 'Biometrics';
}

export const useBiometricLabel = () =>
  useQuery({ queryKey: ['biometrics'], queryFn: getBiometricLabel, staleTime: 0 }).data;

const CANCELLED = ['user_cancel', 'system_cancel', 'app_cancel'];

/**
 * Prompts for biometrics only. The device passcode fallback is disabled on purpose so
 * that transfers are always authorised by either a biometric or the app's own PIN.
 */
export async function authenticate(promptMessage: string): Promise<AuthOutcome> {
  try {
    const result = await authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: true,
      biometricsSecurityLevel: 'strong',
    });

    if (result.success) return 'success';
    return CANCELLED.includes(result.error) ? 'cancelled' : 'fallback';
  } catch {
    return 'fallback';
  }
}
