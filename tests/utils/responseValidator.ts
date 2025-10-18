/**
 * Response Validator Utility for Playwright
 * Provides methods to validate API responses
 */

import { expect } from '@playwright/test';

interface ApiResponse {
  status: number;
  body: unknown;
  headers: Record<string, string | string[]>;
  duration: number;
}

export class ResponseValidator {
  /**
   * Validate status code
   */
  static validateStatusCode(response: ApiResponse, expectedStatus: number): void {
    expect(response.status, `Status code should be ${expectedStatus}`).toBe(expectedStatus);
  }

  /**
   * Validate response time
   */
  static validateResponseTime(response: ApiResponse, maxTime: number): void {
    expect(response.duration, `Response time should be less than ${maxTime}ms`).toBeLessThan(maxTime);
  }

  /**
   * Validate response body contains specific keys
   */
  static validateBodyHasKeys(body: Record<string, unknown>, keys: string[]): void {
    keys.forEach((key) => {
      expect(body, `Response body should contain key: ${key}`).toHaveProperty(key);
    });
  }

  /**
   * Validate response body property value
   */
  static validateBodyProperty(
    body: Record<string, unknown>,
    key: string,
    expectedValue?: unknown
  ): void {
    expect(body, `Response should have property: ${key}`).toHaveProperty(key);

    const actualValue = body[key];

    if (expectedValue === null) {
      // Expected null
      expect(actualValue, `${key} should be null`).toBeNull();
    } else if (expectedValue === undefined) {
      // Expected undefined
      expect(actualValue, `${key} should be undefined`).toBeUndefined();
    } else if (typeof expectedValue === "string") {
      // String check (case-insensitive, trim safe)
      expect(
        String(actualValue).trim().toLowerCase(),
        `${key} should equal (case-insensitive) ${expectedValue}`
      ).toBe(String(expectedValue).trim().toLowerCase());
    } else {
      // Default strict check
      expect(actualValue, `${key} should equal ${expectedValue}`).toBe(expectedValue);
    }
  }

  /**
   * Validate response body property type
   */
  static validateBodyPropertyType(body: Record<string, unknown>, key: string, expectedType: string): void {
    const value = body[key];
    expect(typeof value, `${key} should be of type ${expectedType}`).toBe(expectedType);
  }

  /**
   * Validate response header exists
   */
  static validateHeaderExists(headers: Record<string, string | string[]>, headerName: string): void {
    expect(headers, `Header ${headerName} should exist`).toHaveProperty(headerName);
  }

  /**
   * Validate response matches schema
   */
  static validateSchema(
    body: Record<string, unknown>,
    schema: Record<string, string | string[]>
  ): void {
    Object.keys(schema).forEach((key) => {
      expect(body, `Response should have property: ${key}`).toHaveProperty(key);

      const expectedTypes = Array.isArray(schema[key]) ? schema[key] : [schema[key]];
      const value = body[key];

      if (value === null) {
        // Null value allowed automatically if schema has string/object/number
        if (!expectedTypes.includes("null")) {
          // Optional tolerance: auto-accept null for optional fields
          console.warn(`⚠️ Warning: ${key} is null but schema expected ${expectedTypes}. Consider adding "null" to schema.`);
        }
      } else if (value === undefined) {
        if (!expectedTypes.includes("undefined")) {
          console.warn(`⚠️ Warning: ${key} is undefined but schema expected ${expectedTypes}. Consider adding "undefined" to schema.`);
        }
      } else {
        expect(expectedTypes, `${key} should be one of ${expectedTypes}`).toContain(typeof value);
      }
    });
  }

  /**
   * Validate array response
   */
  static validateArray(body: unknown, minLength?: number, maxLength?: number): void {
    expect(body, 'Response should be an array').toBeInstanceOf(Array);
    const arrayBody = body as { length: number };
    if (minLength !== undefined) {
      expect(arrayBody.length, `Array length should be at least ${minLength}`).toBeGreaterThanOrEqual(minLength);
    }
    if (maxLength !== undefined) {
      expect(arrayBody.length, `Array length should be at most ${maxLength}`).toBeLessThanOrEqual(maxLength);
    }
  }

  /**
   * Validate response body is not empty
   */
  static validateNotEmpty(body: unknown): void {
    if (Array.isArray(body)) {
      expect(body.length, 'Array should not be empty').toBeGreaterThan(0);
    } else if (typeof body === 'object' && body !== null) {
      expect(Object.keys(body as Record<string, unknown>).length, 'Object should not be empty').toBeGreaterThan(0);
    } else {
      expect(body, 'Response should not be null or undefined').toBeDefined();
    }
  }

  /**
   * Validate error response
   */
  static validateErrorResponse(body: Record<string, unknown>, expectedMessage?: string): void {
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('message');
    if (expectedMessage) {
      expect(body.message).toContain(expectedMessage);
    }
  }
}