export function parseDarajaTransactionDate(value: unknown): string | null {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!/^\d{14}$/.test(digits)) return null;
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  const hour = Number(digits.slice(8, 10));
  const minute = Number(digits.slice(10, 12));
  const second = Number(digits.slice(12, 14));
  const local = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (local.getUTCFullYear() !== year || local.getUTCMonth() !== month - 1 || local.getUTCDate() !== day
    || local.getUTCHours() !== hour || local.getUTCMinutes() !== minute || local.getUTCSeconds() !== second) return null;
  // Daraja TransactionDate is local East Africa Time (UTC+3).
  return new Date(local.getTime() - 3 * 60 * 60 * 1000).toISOString();
}

export function nairobiTransactionDay(value: unknown): string {
  const date = value ? new Date(String(value)) : new Date();
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid confirmed M-Pesa transaction date.');
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const fields = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return String(fields.year) + '-' + String(fields.month) + '-' + String(fields.day);
}
