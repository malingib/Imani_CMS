import { describe, expect, it } from 'vitest';
import { isValidProjectAccountPrefix, normalizeProjectAccountPrefix } from './project-account';

describe('project account prefixes', () => {
  it('normalizes spaces and casing', () => {
    expect(normalizeProjectAccountPrefix(' church roof ')).toBe('CHURCH-ROOF');
  });

  it('accepts safe PayBill account identifiers', () => {
    expect(isValidProjectAccountPrefix('ROOF')).toBe(true);
    expect(isValidProjectAccountPrefix('HALL-2026')).toBe(true);
  });

  it('rejects unsafe or empty identifiers', () => {
    expect(isValidProjectAccountPrefix('')).toBe(false);
    expect(isValidProjectAccountPrefix('R')).toBe(false);
    expect(isValidProjectAccountPrefix('roof project')).toBe(true);
    expect(isValidProjectAccountPrefix('ROOF/PROJECT')).toBe(false);
  });
});
