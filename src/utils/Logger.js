import fs from 'fs';
import path from 'path';

/**
 * Logger - Log events to console and file
 */
export class Logger {
  constructor(logFile = 'logs/agent.log') {
    this.logFile = logFile;
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Log a message
   * @param {string} level - Log level (INFO, ERROR, WARN, DEBUG)
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level,
      message,
      ...data
    };

    // Console output with colors
    const coloredOutput = this.colorize(level, `[${timestamp}] [${level}] ${message}`);
    console.log(coloredOutput);

    // File output (no colors)
    const fileOutput = JSON.stringify(entry);
    this.writeToFile(fileOutput);
  }

  /**
   * Info level log
   */
  info(message, data = {}) {
    this.log('INFO', message, data);
  }

  /**
   * Error level log
   */
  error(message, data = {}) {
    this.log('ERROR', message, data);
  }

  /**
   * Warning level log
   */
  warn(message, data = {}) {
    this.log('WARN', message, data);
  }

  /**
   * Debug level log
   */
  debug(message, data = {}) {
    this.log('DEBUG', message, data);
  }

  /**
   * Write to log file
   * @param {string} content
   */
  writeToFile(content) {
    try {
      fs.appendFileSync(this.logFile, content + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Colorize console output
   * @param {string} level
   * @param {string} message
   * @returns {string}
   */
  colorize(level, message) {
    const colors = {
      INFO: '\x1b[36m',    // Cyan
      ERROR: '\x1b[31m',   // Red
      WARN: '\x1b[33m',    // Yellow
      DEBUG: '\x1b[90m',   // Gray
      RESET: '\x1b[0m'
    };

    const color = colors[level] || colors.RESET;
    return `${color}${message}${colors.RESET}`;
  }

  /**
   * Get recent logs
   * @param {number} lines - Number of recent lines to return
   * @returns {Array} - Array of log entries
   */
  getRecentLogs(lines = 50) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return [];
      }

      const content = fs.readFileSync(this.logFile, 'utf-8');
      const allLines = content.trim().split('\n').filter(line => line);
      const recentLines = allLines.slice(-lines);

      return recentLines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { message: line };
        }
      });
    } catch (error) {
      console.error('Failed to read log file:', error.message);
      return [];
    }
  }

  /**
   * Clear log file
   */
  clearLogs() {
    try {
      fs.writeFileSync(this.logFile, '');
      this.info('Log file cleared');
    } catch (error) {
      console.error('Failed to clear log file:', error.message);
    }
  }
}