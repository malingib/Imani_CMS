export function normalizeProjectAccountPrefix(value: string): string {
  return value.trim().replace(/\s+/g, '-').toUpperCase();
}

export function isValidProjectAccountPrefix(value: string): boolean {
  const normalized = normalizeProjectAccountPrefix(value);
  return normalized.length >= 2 && normalized.length <= 32 && /^[A-Z0-9][A-Z0-9_-]*$/.test(normalized);
}
