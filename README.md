# Ryt Transfer

A payment transfer module for a digital banking app, built with React Native (Expo SDK 57) and TypeScript. Users pick a recipient, enter an amount, review the transfer and authorise it with Face ID, Touch ID or fingerprint, with an in-app PIN as the fallback.

## Demo

Demo video: _link to be added_

## Getting started

Requirements: Node 20+, and Xcode or Android Studio for a native build.

```bash
npm install
npx expo run:ios       # or: npx expo run:android
```

A development build is the recommended way to review the app, because Face ID is not available inside Expo Go on iOS.

Other ways to run it:

- **Expo Go**: `npx expo start` and scan the QR code. Touch ID and Android fingerprint work; on Face ID iPhones the app falls back to the PIN.
- **Web**: `npm run web` for a quick look at the UI. There are no biometrics or contacts on web, so it uses the PIN path.

### Trying biometrics on a simulator

- **iOS Simulator**: Features → Face ID → Enrolled. When the prompt appears, use Features → Face ID → Matching Face (or Non-matching Face to see the PIN fallback).
- **Android emulator**: enrol a fingerprint in Settings → Security, then run `adb -e emu finger touch 1` while the prompt is open.

## Demo data and scenarios

The backend is mocked in memory (`src/features/transfer/api.ts`) with realistic latency. It resets when the app reloads.

| Scenario                         | How to trigger                                   |
| -------------------------------- | ------------------------------------------------ |
| App PIN                          | `123456`                                         |
| PIN lockout                      | Enter a wrong PIN three times (reload to reset)  |
| Starting balance                 | RM 8,450.75                                      |
| Insufficient balance             | Any amount above the balance                     |
| Per-transfer limit               | Any amount above RM 10,000                       |
| Connection drops, retry succeeds | Send exactly **RM 4.04**, then tap _Try again_   |
| Service unavailable              | Send exactly **RM 5.03**                         |
| Account not found                | Type any 10-16 digit number ending in `0000`     |
| New recipient (name enquiry)     | Type any other 10-16 digit account/mobile number |

## Scripts

```bash
npm test            # unit and integration tests
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
```

## Project structure

```
src/
  App.tsx                  providers + navigator
  theme.ts                 colours, spacing, type scale
  components/              shared UI kit (Button, TextField, Screen, ListItem, ...)
  lib/                     framework-agnostic helpers: money, formatting, API errors, biometrics
  navigation/              native stack and typed routes
  features/transfer/       the module itself
    api.ts                 mock backend: account, history, name enquiry, transfer
    queries.ts             TanStack Query hooks over the API
    store.ts               transfer draft (Zustand)
    validation.ts          pure validation rules
    useContacts.ts         device contacts mapped to recipients
    components/            BalanceCard, PinSheet, TransferSummary, rows, ...
    screens/               Transfer, Recipients, Review, Receipt, History
```

Everything transfer-specific lives in `features/transfer`, so the module can be dropped into a larger app and the mock API swapped for a real client without touching the screens.

## Design decisions

**Flow.** Transfer → Review → biometric/PIN → Receipt. The review screen receives a snapshot of the draft through route params, so what the user confirms can't change underneath them. The receipt replaces the review screen and has no back navigation, which removes any path to resubmitting a completed transfer.

**State.** Server data (balance, history, name lookups, contacts) is handled by TanStack Query: caching, loading and error states, and invalidation of the balance and history after a transfer. It also refetches when the app returns to the foreground. The draft being composed is shared by the form, the recipient picker and the history screen, so it lives in a small Zustand store; components select only the fields they use.

**Money.** Amounts are integers in sen everywhere except the text input, so there is no floating point drift. Input is sanitised as the user types (one decimal point, two decimal places, no leading zeros) and formatted with `Intl.NumberFormat('en-MY')`. A comma typed on a comma-decimal keyboard is treated as the decimal point, so `12,50` is RM 12.50 and never RM 1,250.

**Biometric authentication.**

- The prompt appears only when the user confirms the transfer, and the message includes the amount and recipient.
- The device passcode fallback is disabled (`disableDeviceFallback`), so knowing the phone's passcode is not enough to move money. Cancelling the prompt does nothing; a failure, lockout or missing enrolment opens the app PIN instead. The user can also choose _Use PIN instead_ up front.
- On Android only strong (Class 3) biometrics are accepted.
- The PIN is verified by the backend as part of the transfer request and is never stored on the device. Three wrong attempts lock it. The request is dropped from the query cache once the review screen closes, so the PIN doesn't linger in memory.

**Safe retries.** Each review generates one idempotency key. If the connection drops after the server has processed the transfer, retrying with the same key returns the original result instead of charging twice. Transfers are never retried automatically; the user decides.

**Recipient verification.** Typing an account or mobile number triggers a DuitNow-style name enquiry, so the user sees who they are paying before selecting a new recipient.

**Errors.** API errors are typed (`ApiError` with a code, a user-facing message and an `isRetryable` flag). Retryable failures turn the confirm button into _Try again_; others offer _Edit transfer_. Amount errors show live while typing, and the remaining fields show theirs after the first Continue. Denied contacts permission explains why and links to Settings.

**Performance.**

- Contacts and history use FlashList with stable keys and item types. The contacts list has sticky section headers, and history is seeded with 300 transfers to exercise scrolling.
- List rows are memoised and receive stable callbacks.
- The balance card and recent recipients are memoised components with their own data subscriptions, so typing an amount doesn't re-render them.
- Contact search uses `useDeferredValue`, so filtering a large list never blocks typing.

**Responsive UI.** A shared `Screen` handles safe areas, keyboard avoidance and a sticky footer, and caps content at 560pt so tablets and web stay readable. All orientations are supported. Animations use Reanimated: a spring on the success badge, a slide-up PIN sheet and a shake on a wrong PIN. Buttons, rows and errors carry accessibility roles, labels and live regions.

## Challenges

- **expo-contacts changed in SDK 57.** The old functions now throw at runtime in favour of a class-based `Contact` API. I worked from the package's type definitions, and mocked the module in Jest because it extends a native class at import time.
- **Face ID in Expo Go.** It isn't supported there, so the PIN fallback doubles as the path that keeps the app usable in Expo Go, on simulators without enrolment, and on web.
- **Testing setup.** React Native Testing Library v14 makes `render` and events async, Reanimated 4 needs the worklets Jest resolver, and `Intl` puts a non-breaking space after "RM", which the assertions account for.

## Assumptions

- A single MYR savings account; RM 1 minimum and RM 10,000 maximum per transfer.
- Recipients are identified by a bank account or mobile number of 10-16 digits.
- Contacts are matched on their first phone number; `+60` numbers are converted to the local `01…` format.

## With more time

- Bind biometrics to a Keychain/Keystore key that signs a server challenge, rather than trusting the local prompt result.
- Root/jailbreak checks and screenshot protection on sensitive screens.
- Bank selection, favourites and scheduled transfers.
- Dark mode and Bahasa Malaysia.
- End-to-end tests on devices with Maestro.
