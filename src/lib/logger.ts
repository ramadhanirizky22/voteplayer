/* eslint-disable no-console */
export interface LogContext {
  requestId?: string;
  userId?: string;
  path?: string;
  [key: string]: unknown;
}

class StructuredLogger {
  private isProd = process.env.NODE_ENV === 'production';

  info(message: string, context: LogContext = {}) {
    const payload = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };
    if (this.isProd) {
      console.log(JSON.stringify(payload));
    } else {
      console.log(`[INFO] ${message}`, context);
    }
  }

  error(message: string, error?: unknown, context: LogContext = {}) {
    const payload = {
      level: 'error',
      message,
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
      timestamp: new Date().toISOString(),
      ...context,
    };
    if (this.isProd) {
      console.error(JSON.stringify(payload));
    } else {
      console.error(`[ERROR] ${message}`, error, context);
    }
  }

  warn(message: string, context: LogContext = {}) {
    const payload = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };
    if (this.isProd) {
      console.warn(JSON.stringify(payload));
    } else {
      console.warn(`[WARN] ${message}`, context);
    }
  }
}

export const logger = new StructuredLogger();
