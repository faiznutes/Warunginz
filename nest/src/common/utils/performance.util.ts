import { applyDecorators, SetMetadata } from '@nestjs/common';

/**
 * Performance-related decorators and utilities
 */

export const CACHE_KEY_METADATA = 'cache_key';
export const RATE_LIMIT_METADATA = 'rate_limit';
export const PERFORMANCE_THRESHOLD_METADATA = 'perf_threshold_ms';
export const REQUIRES_PAGINATION_METADATA = 'requires_pagination';

/**
 * Cache decorator - stores result in memory for specified duration
 * Usage: @Cacheable(60000) - cache for 60 seconds
 */
export function Cacheable(ttlMs: number = 300000) {
  return applyDecorators(
    SetMetadata(CACHE_KEY_METADATA, ttlMs),
  );
}

/**
 * Performance threshold decorator - warns if response takes longer
 * Usage: @PerformanceThreshold(100) - warn if takes > 100ms
 */
export function PerformanceThreshold(thresholdMs: number = 100) {
  return applyDecorators(
    SetMetadata(PERFORMANCE_THRESHOLD_METADATA, thresholdMs),
  );
}

/**
 * Pagination required decorator - ensures endpoint respects pagination
 * Usage: @RequiresPagination() - enforces page/limit params
 */
export function RequiresPagination() {
  return applyDecorators(
    SetMetadata(REQUIRES_PAGINATION_METADATA, true),
  );
}

/**
 * Query performance monitoring utility
 */
export class QueryPerformanceMonitor {
  private queries: Map<string, PerformanceMetrics> = new Map();

  record(queryName: string, executionTimeMs: number, rowCount: number = 0) {
    const existing = this.queries.get(queryName) || {
      totalTime: 0,
      count: 0,
      minTime: Infinity,
      maxTime: 0,
      rowCounts: [],
    };

    existing.totalTime += executionTimeMs;
    existing.count++;
    existing.minTime = Math.min(existing.minTime, executionTimeMs);
    existing.maxTime = Math.max(existing.maxTime, executionTimeMs);
    existing.rowCounts.push(rowCount);

    this.queries.set(queryName, existing);
  }

  getMetrics(queryName?: string): PerformanceMetrics | Record<string, PerformanceMetrics> {
    if (queryName) {
      return this.queries.get(queryName) || { totalTime: 0, count: 0, minTime: 0, maxTime: 0, rowCounts: [] };
    }
    return Object.fromEntries(this.queries);
  }

  isSlowQuery(queryName: string, thresholdMs: number = 100): boolean {
    const metrics = this.queries.get(queryName);
    return metrics ? metrics.maxTime > thresholdMs : false;
  }

  reset() {
    this.queries.clear();
  }
}

export interface PerformanceMetrics {
  totalTime: number;
  count: number;
  minTime: number;
  maxTime: number;
  rowCounts: number[];
  avgTime?: number;
  avgRowCount?: number;
  p95Time?: number;
  p99Time?: number;
}

/**
 * Cache management utility with TTL support
 */
export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupIntervalMs = 60000; // Every 60 seconds
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(autoCleanup: boolean = true) {
    if (autoCleanup) {
      this.startAutoCleanup();
    }
  }

  set(key: string, value: any, ttlMs: number = 300000) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }

  private startAutoCleanup() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach((key) => this.cache.delete(key));
    }, this.cleanupIntervalMs);
  }

  stop() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

interface CacheEntry {
  value: any;
  expiresAt: number;
}

/**
 * Query result pagination enforcement
 * Ensures queries don't return more than maxResults
 */
export class PaginationEnforcer {
  private readonly DEFAULT_PAGE_SIZE = 20;
  private readonly MAX_PAGE_SIZE = 100;

  validatePagination(
    page?: number,
    limit?: number,
  ): { page: number; limit: number } {
    const validPage = Math.max(1, page || 1);
    const validLimit = Math.min(
      Math.max(1, limit || this.DEFAULT_PAGE_SIZE),
      this.MAX_PAGE_SIZE,
    );

    return { page: validPage, limit: validLimit };
  }

  calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }
}

/**
 * Database query optimization analyzer
 * Detects N+1 query patterns and large result sets
 */
export class QueryOptimizationAnalyzer {
  private executedQueries: QueryExecutionRecord[] = [];
  private readonly maxRecordedQueries = 1000;

  recordQuery(query: string, executionTimeMs: number, resultCount: number) {
    this.executedQueries.push({
      query: this.normalizeQuery(query),
      executionTimeMs,
      resultCount,
      timestamp: Date.now(),
    });

    // Keep only recent queries
    if (this.executedQueries.length > this.maxRecordedQueries) {
      this.executedQueries.shift();
    }
  }

  detectN1Pattern(): N1PatternDetection[] {
    const patterns: Map<string, N1PatternDetection> = new Map();

    for (const query of this.executedQueries) {
      const key = query.query;
      const existing = patterns.get(key);

      if (existing) {
        existing.count++;
        existing.totalTimeMs += query.executionTimeMs;
      } else {
        patterns.set(key, {
          baseQuery: key,
          count: 1,
          totalTimeMs: query.executionTimeMs,
          averageTimeMs: query.executionTimeMs,
        });
      }
    }

    return Array.from(patterns.values())
      .filter((p) => p.count > 5) // Only report if repeated >5 times
      .sort((a, b) => b.totalTimeMs - a.totalTimeMs);
  }

  getLargeResultSets(thresholdRows: number = 1000): QueryExecutionRecord[] {
    return this.executedQueries.filter((q) => q.resultCount > thresholdRows);
  }

  private normalizeQuery(query: string): string {
    // Remove parameters and normalize for grouping
    return query.replace(/\$\d+/g, '?').replace(/\s+/g, ' ').trim();
  }

  reset() {
    this.executedQueries = [];
  }
}

interface QueryExecutionRecord {
  query: string;
  executionTimeMs: number;
  resultCount: number;
  timestamp: number;
}

interface N1PatternDetection {
  baseQuery: string;
  count: number;
  totalTimeMs: number;
  averageTimeMs: number;
}
