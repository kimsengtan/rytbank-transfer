import { fireEvent, render, screen } from '@testing-library/react-native';

import App from '@/App';
import { authenticate, useBiometricLabel } from '@/lib/biometrics';
import { queryClient } from '@/lib/queryClient';

import { useTransferDraft } from './store';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  delay: () => Promise.resolve(),
}));

jest.mock('@/lib/biometrics', () => ({
  authenticate: jest.fn(),
  useBiometricLabel: jest.fn(),
}));

const mockAuthenticate = jest.mocked(authenticate);
const mockBiometricLabel = jest.mocked(useBiometricLabel);

async function startTransfer(amount: string) {
  await render(<App />);
  await screen.findByText(/^Savings \d/);

  await fireEvent.press(await screen.findByLabelText('Pay Daniel Tan'));
  await fireEvent.changeText(screen.getByLabelText('Amount'), amount);
  await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
}

async function enterPin(pin: string) {
  for (const digit of pin) await fireEvent.press(screen.getByLabelText(digit));
}

beforeEach(() => {
  queryClient.clear();
  useTransferDraft.getState().reset();
  mockBiometricLabel.mockReturnValue('Face ID');
});

it('blocks amounts above the available balance', async () => {
  await startTransfer('9000');

  expect(screen.getByText('Amount exceeds your available balance')).toBeOnTheScreen();
  expect(screen.queryByText('Review transfer')).toBeNull();
});

it('sends the transfer once biometrics succeed', async () => {
  mockAuthenticate.mockResolvedValue('success');
  await startTransfer('25');

  await fireEvent.press(await screen.findByRole('button', { name: 'Confirm with Face ID' }));

  expect(await screen.findByText('Transfer successful')).toBeOnTheScreen();
  expect(mockAuthenticate).toHaveBeenCalledWith(expect.stringMatching(/RM\s25\.00 to Daniel Tan/));
});

it('does nothing when the biometric prompt is cancelled', async () => {
  mockAuthenticate.mockResolvedValue('cancelled');
  await startTransfer('25');

  await fireEvent.press(await screen.findByRole('button', { name: 'Confirm with Face ID' }));

  expect(await screen.findByRole('button', { name: 'Confirm with Face ID' })).toBeOnTheScreen();
  expect(screen.queryByText('Enter your PIN')).toBeNull();
});

it('falls back to the PIN when biometrics fail', async () => {
  mockAuthenticate.mockResolvedValue('fallback');
  await startTransfer('25');

  await fireEvent.press(await screen.findByRole('button', { name: 'Confirm with Face ID' }));
  await enterPin('000000');
  expect(await screen.findByText('Incorrect PIN. Please try again.')).toBeOnTheScreen();

  await enterPin('123456');
  expect(await screen.findByText('Transfer successful')).toBeOnTheScreen();
});

it('lets the user choose the PIN instead of biometrics', async () => {
  await startTransfer('25');

  await fireEvent.press(await screen.findByRole('button', { name: 'Use PIN instead' }));

  expect(await screen.findByText('Enter your PIN')).toBeOnTheScreen();
  expect(mockAuthenticate).not.toHaveBeenCalled();
});

it('retries safely after the connection drops', async () => {
  mockAuthenticate.mockResolvedValue('success');
  await startTransfer('4.04');

  await fireEvent.press(await screen.findByRole('button', { name: 'Confirm with Face ID' }));
  expect(await screen.findByText(/couldn't reach the server/)).toBeOnTheScreen();

  await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('Transfer successful')).toBeOnTheScreen();
});

it('goes straight to the PIN on devices without biometrics', async () => {
  mockBiometricLabel.mockReturnValue(null);
  await startTransfer('25');

  await fireEvent.press(await screen.findByRole('button', { name: 'Confirm with PIN' }));

  expect(await screen.findByText('Enter your PIN')).toBeOnTheScreen();
  expect(mockAuthenticate).not.toHaveBeenCalled();
});
