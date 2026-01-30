/**
 * Performance optimization utilities
 */

// Performance timing utility
export function measurePerformance<T>(label: string, fn: () => T): T {
  if (process.env.NODE_ENV !== 'production') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⚡ Performance [${label}]: ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return fn();
}

// Async performance timing
export async function measureAsyncPerformance<T>(
  label: string, 
  fn: () => Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV !== 'production') {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`⚡ Performance [${label}]: ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return await fn();
}

// Debounce utility for expensive operations
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for frequent operations
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization with expiration
export function memoizeWithExpiration<T extends (...args: any[]) => any>(
  fn: T,
  expiration: number = 30000 // 30 seconds default
): T {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < expiration) {
      return cached.value;
    }
    
    const result = fn(...args);
    cache.set(key, { value: result, timestamp: Date.now() });
    
    // Clean up expired entries periodically
    if (cache.size > 100) {
      for (const [k, v] of cache.entries()) {
        if (Date.now() - v.timestamp > expiration) {
          cache.delete(k);
        }
      }
    }
    
    return result;
  }) as T;
}

// Simple LRU cache implementation
export class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V>;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}