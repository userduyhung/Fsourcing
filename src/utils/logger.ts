/**
 * Centralized logging utility
 * - Provides consistent, tagged logging across the application
 * - Automatically disables debug logs in production
 * - Easy to filter by log level in browser console
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProduction = import.meta.env.MODE === 'production';

/**
 * Format log message with timestamp and tag
 */
function formatMessage(level: LogLevel, tag: string, message: string, data?: any): any[] {
  const timestamp = new Date().toLocaleTimeString('vi-VN');
  const emoji = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
  }[level];

  const formattedMsg = `${emoji} [${timestamp}] [${tag}] ${message}`;
  
  return data !== undefined ? [formattedMsg, data] : [formattedMsg];
}

/**
 * Logging helper with production-safe debug mode
 */
export const logger = {
  /**
   * Debug logs - disabled in production
   * Use for development-only debugging information
   */
  debug: (tag: string, message: string, data?: any) => {
    if (!isProduction) {
      console.debug(...formatMessage('debug', tag, message, data));
    }
  },

  /**
   * Info logs - always enabled
   * Use for important application state changes
   */
  info: (tag: string, message: string, data?: any) => {
    console.info(...formatMessage('info', tag, message, data));
  },

  /**
   * Warning logs - always enabled
   * Use for recoverable issues or unexpected behavior
   */
  warn: (tag: string, message: string, data?: any) => {
    console.warn(...formatMessage('warn', tag, message, data));
  },

  /**
   * Error logs - always enabled
   * Use for errors and exceptions
   */
  error: (tag: string, message: string, data?: any) => {
    console.error(...formatMessage('error', tag, message, data));
  },
};

/**
 * Usage examples:
 * 
 * logger.debug('AuthService', 'Token validated', { userId: 123 });
 * logger.info('CartService', 'Item added to cart', { productId: 456 });
 * logger.warn('API', 'Slow response detected', { duration: 5000 });
 * logger.error('Payment', 'Transaction failed', error);
 */
