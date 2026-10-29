import { describe, expect, it } from 'vitest';
import { parseCsv, stringifyCsv } from './csv';

describe('CSV helpers', () => {
  it('parses quoted commas, escaped quotes, and multiline fields', () => {
    expect(parseCsv('Name,Location,Note\r\n"Amina, Jane",Nairobi,"Said ""hello""\nthere"')).toEqual([
      ['Name', 'Location', 'Note'],
      ['Amina, Jane', 'Nairobi', 'Said "hello"\nthere'],
    ]);
  });

  it('round-trips values that need CSV quoting', () => {
    const rows = [['Name', 'Email', 'Groups'], ['Amina, Jane', 'a@example.com', 'Youth; "Media"']];
    expect(parseCsv(stringifyCsv(rows))).toEqual(rows);
  });

  it('rejects unterminated quoted fields', () => {
    expect(() => parseCsv('Name,Email\n"Amina,a@example.com')).toThrow('unterminated quoted field');
  });
});
