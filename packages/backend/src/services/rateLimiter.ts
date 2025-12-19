/**
 * RateLimiter implements sliding window rate limiting
 * Requirements: 11.1, 11.4, 11.5
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Checks if a request from the given identifier should be allowed
   * Requirements: 11.1, 11.4
   */
  async checkLimit(identifier: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    let timestamps = this.requests.get(identifier) || [];

    // Remove timestamps outside the current window
    timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    // Check if limit is exceeded
    if (timestamps.length >= this.maxRequests) {
      // Update the map with cleaned timestamps
      this.requests.set(identifier, timestamps);
      return false;
    }

    return true;
  }

  /**
   * Records a request from the given identifier
   * Requirements: 11.1, 11.4
   */
  async recordRequest(identifier: string): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    let timestamps = this.requests.get(identifier) || [];

    // Remove timestamps outside the current window
    timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    // Add current timestamp
    timestamps.push(now);

    // Store updated timestamps
    this.requests.set(identifier, timestamps);
  }

  /**
   * Gets the time until the rate limit resets for an identifier
   * Returns milliseconds until oldest request expires
   */
  getTimeUntilReset(identifier: string): number {
    const timestamps = this.requests.get(identifier) || [];
    if (timestamps.length === 0) {
      return 0;
    }

    const oldestTimestamp = Math.min(...timestamps);
    const resetTime = oldestTimestamp + this.windowMs;
    const now = Date.now();

    return Math.max(0, resetTime - now);
  }

  /**
   * Gets the configured window duration in milliseconds
   */
  getWindowMs(): number {
    return this.windowMs;
  }

  /**
   * Gets the configured max requests per window
   */
  getMaxRequests(): number {
    return this.maxRequests;
  }

  /**
   * Clears all rate limit data (useful for testing)
   */
  clear(): void {
    this.requests.clear();
  }
}
