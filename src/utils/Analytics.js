/**
 * Analytics - Track usage metrics and statistics
 */
export class Analytics {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      requestsByType: {
        sql_query: 0,
        code_review: 0,
        prompt_enhancement: 0
      },
      avgResponseTime: 0,
      responseTimes: [],
      startTime: new Date()
    };
  }

  /**
   * Track a request
   * @param {string} type - Request type (sql_query, code_review, prompt_enhancement)
   * @param {number} duration - Request duration in milliseconds
   * @param {boolean} success - Whether request succeeded
   */
  trackRequest(type, duration, success = true) {
    this.metrics.totalRequests++;
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Track by type
    if (this.metrics.requestsByType[type] !== undefined) {
      this.metrics.requestsByType[type]++;
    }

    // Track response time
    this.metrics.responseTimes.push(duration);
    
    // Update average (keep only last 100 for memory efficiency)
    if (this.metrics.responseTimes.length > 100) {
      this.metrics.responseTimes.shift();
    }
    
    const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
    this.metrics.avgResponseTime = Math.round(sum / this.metrics.responseTimes.length);
  }

  /**
   * Get all metrics
   * @returns {Object} - Complete metrics object
   */
  getMetrics() {
    const uptime = new Date() - this.metrics.startTime;
    const uptimeSeconds = Math.floor(uptime / 1000);
    
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0
        ? ((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(2) + '%'
        : '0%',
      uptimeSeconds: uptimeSeconds,
      uptimeFormatted: this.formatUptime(uptimeSeconds),
      requestsPerMinute: this.metrics.totalRequests > 0 && uptimeSeconds > 0
        ? ((this.metrics.totalRequests / uptimeSeconds) * 60).toFixed(2)
        : '0'
    };
  }

  /**
   * Get metrics summary
   * @returns {Object} - Summary of key metrics
   */
  getSummary() {
    const metrics = this.getMetrics();
    return {
      totalRequests: metrics.totalRequests,
      successRate: metrics.successRate,
      avgResponseTime: metrics.avgResponseTime + 'ms',
      uptime: metrics.uptimeFormatted,
      mostUsedFeature: this.getMostUsedFeature()
    };
  }

  /**
   * Get most used feature
   * @returns {string}
   */
  getMostUsedFeature() {
    const types = this.metrics.requestsByType;
    let maxType = 'none';
    let maxCount = 0;

    for (const [type, count] of Object.entries(types)) {
      if (count > maxCount) {
        maxCount = count;
        maxType = type;
      }
    }

    return maxType;
  }

  /**
   * Format uptime in human-readable format
   * @param {number} seconds
   * @returns {string}
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      requestsByType: {
        sql_query: 0,
        code_review: 0,
        prompt_enhancement: 0
      },
      avgResponseTime: 0,
      responseTimes: [],
      startTime: new Date()
    };
  }
}