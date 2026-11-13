import { parseDarajaTransactionDate, nairobiTransactionDay } from './mpesa-date.ts';

Deno.test('converts Daraja local transaction timestamps from EAT to UTC', () => {
  const actual = parseDarajaTransactionDate('20261114020705');
  if (actual !== '2026-11-13T23:07:05.000Z') throw new Error('unexpected UTC timestamp: ' + actual);
});

Deno.test('rejects malformed or impossible Daraja transaction dates', () => {
  for (const value of ['', '202611140207', '20261314020705', '20260230020705', 'not-a-date']) {
    if (parseDarajaTransactionDate(value) !== null) throw new Error('accepted invalid timestamp: ' + value);
  }
});

Deno.test('formats confirmed payment date in the Nairobi timezone', () => {
  const actual = nairobiTransactionDay('2026-11-13T23:07:05.000Z');
  if (actual !== '2026-11-14') throw new Error('unexpected Nairobi date: ' + actual);
});
