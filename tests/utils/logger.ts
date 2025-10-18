/**
 * Logger Utility for Playwright
 * Provides consistent logging throughout the framework
 */

export class Logger {
  static info(message: string, data?: Record<string, unknown> | string | number | boolean): void {
    console.log(`ℹ️ INFO: ${message}`);
    if (data) {
      console.log(`INFO: ${message}`);
      console.log(data);
    } else {
      console.log(`INFO: ${message}`);
    }
  }

  static success(message: string): void {
    console.log(`✅ SUCCESS: ${message}`);
  }

  static error(message: string, error?: Error | string | unknown): void {
    console.error(`❌ ERROR: ${message}`);
    if (error) {
      console.error(error);
    }
  }

  static warning(message: string): void {
    console.warn(`⚠️ WARNING: ${message}`);
  }

  static request(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string, url: string, body?: Record<string, unknown> | string | null): void {
    console.log(`🚀 ${method} Request: ${url}`);
    if (body) {
      try {
        console.log(`Request Body: ${JSON.stringify(body, null, 2)}`);
      } catch (error) {
        console.log(`Request Body: [Unable to stringify body: ${error}]`);
      }
    }
  }

  static response(status: number, body: unknown, duration: number): void {
    console.log(`📥 Response: ${status} (${duration}ms)`);
    console.log(`Response Status: ${status}`);
    console.log(`Response Duration: ${duration}ms`);
    try {
      console.log(`Response Body: ${JSON.stringify(body, null, 2)}`);
    } catch (error) {
      console.log(`Response Body: [Unable to stringify body: ${error}]`);
    }
  }

  static assertion(message: string): void {
    console.log(`🔍 Assertion: ${message}`);
  }
}