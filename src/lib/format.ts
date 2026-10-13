const dateTime = new Intl.DateTimeFormat('en-MY', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

/** Mobile numbers read as "012-345 6789", bank accounts in groups of four. */
export function formatAccountNumber(value: string) {
  if (/^01\d{8,9}$/.test(value)) return value.replace(/^(\d{3})(\d+)(\d{4})$/, '$1-$2 $3');
  return value.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export const digitsOnly = (value: string) => value.replace(/\D/g, '');
