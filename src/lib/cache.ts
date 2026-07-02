/**
 * Simple caching utilities for client-side data caching
 * Uses sessionStorage for session-scoped cache
 * Prevents redundant API calls within same session
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  namespace?: string; // Namespace for cache keys
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_PREFIX = 'imani_cache_';

/**
 * Get cache key with namespace
 */
function getCacheKey(key: string, namespace?: string): string {
  const prefix = namespace ? `${CACHE_PREFIX}${namespace}_` : CACHE_PREFIX;
  return `${prefix}${key}`;
}

/**
 * Check if cache entry is expired
 */
function isExpired(entry: CacheEntry<any>): boolean {
  return Date.now() > entry.expiresAt;
}

/**
 * Set a value in cache
 */
export function setCacheValue<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): void {
  const { ttl = DEFAULT_TTL, namespace } = options;
  const cacheKey = getCacheKey(key, namespace);

  const entry: CacheEntry<T> = {
    data: value,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttl,
  };

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to set cache:', error);
  }
}

/**
 * Get a value from cache
 * Returns null if not found or expired
 */
export function getCacheValue<T>(
  key: string,
  options: CacheOptions = {}
): T | null {
  const { namespace } = options;
  const cacheKey = getCacheKey(key, namespace);

  try {
    const item = sessionStorage.getItem(cacheKey);
    if (!item) return null;

    const entry: CacheEntry<T> = JSON.parse(item);

    if (isExpired(entry)) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn('Failed to get cache:', error);
    return null;
  }
}

/**
 * Check if a cache key exists and is not expired
 */
export function hasCacheValue(key: string, options: CacheOptions = {}): boolean {
  const { namespace } = options;
  const cacheKey = getCacheKey(key, namespace);

  try {
    const item = sessionStorage.getItem(cacheKey);
    if (!item) return false;

    const entry: CacheEntry<any> = JSON.parse(item);
    return !isExpired(entry);
  } catch {
    return false;
  }
}

/**
 * Clear a specific cache entry
 */
export function clearCacheValue(key: string, options: CacheOptions = {}): void {
  const { namespace } = options;
  const cacheKey = getCacheKey(key, namespace);

  try {
    sessionStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

/**
 * Clear all cache entries in a namespace
 */
export function clearCacheNamespace(namespace: string): void {
  try {
    const prefix = `${CACHE_PREFIX}${namespace}_`;
    const keys = Object.keys(sessionStorage);

    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear cache namespace:', error);
  }
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(sessionStorage);

    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear all cache:', error);
  }
}

/**
 * Get cached value or fetch if not cached
 * Useful for data loading with automatic caching
 */
export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Check cache first
  const cached = getCacheValue<T>(key, options);
  if (cached !== null) {
    return cached;
  }

  // Fetch if not cached
  const data = await fetcher();

  // Store in cache
  setCacheValue(key, data, options);

  return data;
}

/**
 * Cache decorator for functions (HOF)
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions = {}
): T {
  return (async (...args: any[]) => {
    const cacheKey = `${fn.name}_${JSON.stringify(args)}`;
    return getCachedOrFetch(cacheKey, () => fn(...args), options);
  }) as T;
}

/**
 * Cache storage info (for debugging)
 */
export function getCacheStats(): {
  count: number;
  size: number;
  entries: string[];
} {
  const entries: string[] = [];
  let totalSize = 0;

  try {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        entries.push(key);
        const item = sessionStorage.getItem(key);
        totalSize += item?.length ?? 0;
      }
    });
  } catch (error) {
    console.warn('Failed to get cache stats:', error);
  }

  return {
    count: entries.length,
    size: totalSize,
    entries,
  };
}

/**
 * Cache invalidation helper
 * Useful for invalidating cache after mutations
 */
export class CacheInvalidator {
  private namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  invalidate(key: string): void {
    clearCacheValue(key, { namespace: this.namespace });
  }

  invalidateAll(): void {
    clearCacheNamespace(this.namespace);
  }

  invalidateMatching(pattern: RegExp): void {
    try {
      const prefix = `${CACHE_PREFIX}${this.namespace}_`;
      const keys = Object.keys(sessionStorage);

      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          const subKey = key.substring(prefix.length);
          if (pattern.test(subKey)) {
            sessionStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to invalidate cache:', error);
    }
  }
}

/**
 * Predefined cache invalidators for common operations
 */
export const cacheInvalidators = {
  members: new CacheInvalidator('members'),
  transactions: new CacheInvalidator('transactions'),
  events: new CacheInvalidator('events'),
  budgets: new CacheInvalidator('budgets'),
  communications: new CacheInvalidator('communications'),
};
