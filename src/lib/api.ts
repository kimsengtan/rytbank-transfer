export type ApiErrorCode =
  | 'INSUFFICIENT_FUNDS'
  | 'LIMIT_EXCEEDED'
  | 'INVALID_PIN'
  | 'PIN_LOCKED'
  | 'ACCOUNT_NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'SERVICE_UNAVAILABLE';

const MESSAGES: Record<ApiErrorCode, string> = {
  INSUFFICIENT_FUNDS: "You don't have enough balance for this transfer.",
  LIMIT_EXCEEDED: 'This amount is above your per-transfer limit.',
  INVALID_PIN: 'Incorrect PIN. Please try again.',
  PIN_LOCKED: 'Too many incorrect attempts, so your PIN is locked for now.',
  ACCOUNT_NOT_FOUND: "We couldn't find an account with this number.",
  NETWORK_ERROR: "We couldn't reach the server. Check your connection and try again.",
  SERVICE_UNAVAILABLE: 'Transfers are temporarily unavailable. Please try again shortly.',
};

const RETRYABLE: ApiErrorCode[] = ['NETWORK_ERROR', 'SERVICE_UNAVAILABLE'];

export class ApiError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode) {
    super(MESSAGES[code]);
    this.name = 'ApiError';
    this.code = code;
  }

  /** Whether sending the same request again could succeed. */
  get isRetryable() {
    return RETRYABLE.includes(this.code);
  }
}

export const isApiError = (error: unknown, code?: ApiErrorCode): error is ApiError =>
  error instanceof ApiError && (!code || error.code === code);

export const getErrorMessage = (error: unknown) =>
  isApiError(error) ? error.message : 'Something went wrong. Please try again.';

export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
