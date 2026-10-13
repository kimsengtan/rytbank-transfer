/**
 * Money is handled in sen (integer minor units) everywhere outside of text inputs
 * so that arithmetic never runs into floating point rounding.
 */

const currency = new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' });

export const formatMoney = (sen: number) => currency.format(sen / 100);

/** Parses a sanitised amount string ("12.5") into sen (1250). Returns 0 for empty input. */
export function toSen(input: string): number {
  return Math.round(Number(input || 0) * 100);
}

/** Converts sen back into the plain string format used by the amount input. */
export const toAmountInput = (sen: number) => (sen / 100).toFixed(2);

const MAX_INTEGER_DIGITS = 7;

/**
 * Normalises raw keyboard input into a valid amount string: digits only,
 * a single decimal point, at most two decimal places and no leading zeros.
 */
export function sanitizeAmount(text: string): string {
  const [whole = '', ...fraction] = text.replace(/[^\d.]/g, '').split('.');
  const integer = whole.replace(/^0+(?=\d)/, '').slice(0, MAX_INTEGER_DIGITS);

  if (fraction.length === 0) return integer;
  return `${integer || '0'}.${fraction.join('').slice(0, 2)}`;
}
