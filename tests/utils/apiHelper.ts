/**
 * API Helper Utility for Playwright
 * Provides reusable methods for making API requests with enhanced logging and error handling
 */

import { APIRequestContext } from '@playwright/test';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown> | string | unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  failOnStatusCode?: boolean;
  timeout?: number;
}

// API Response interfaces
interface UserObject {
  user_id: string | number;
  [key: string]: unknown;
}

interface LoginResponseBody {
  status: string;
  message: string;
  token?: string;
  object?: UserObject;
  [key: string]: unknown;
}

interface OtpVerificationResponseBody {
  status: string;
  message?: string;
  token?: string;
  object?: UserObject;
  [key: string]: unknown;
}

interface ApiResponse<T = unknown> {
  status: number;
  body: T;
  headers: Record<string, string | string[]>;
  duration: number;
}

export class ApiHelper {
  private request: APIRequestContext;
  private static readonly defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /**
   * Make a generic API request
   */
  static async makeRequest<T = unknown>(
    request: APIRequestContext,
    options: RequestOptions
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();

    const requestOptions: {
      method: string;
      headers?: Record<string, string>;
      timeout?: number;
      data?: unknown;
    } = {
      method: options.method || 'GET',
      headers: { ...this.defaultHeaders, ...options.headers },
      timeout: options.timeout || 30000,
    };

    if (options.body) {
      requestOptions.data = options.body;
    }

    if (options.params) {
      // Convert params to query string for GET requests
      if (options.method === 'GET' || !options.method) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          searchParams.append(key, String(value));
        });
        const separator = options.url.includes('?') ? '&' : '?';
        options.url += separator + searchParams.toString();
      }
    }

    console.log(`🚀 ${options.method || 'GET'} Request: ${options.url}`);

    try {
      const response = await request.fetch(options.url, requestOptions);
      const endTime = Date.now();

      console.log(`✅ Response Status: ${response.status()}`);

      const responseBody = await response.json();

      return {
        status: response.status(),
        body: responseBody as T,
        headers: response.headers(),
        duration: endTime - startTime,
      };
    } catch (error) {
      console.error(`❌ Request failed: ${error}`);
      throw error;
    }
  }

  /**
   * GET request
   */
  static async get(
    request: APIRequestContext,
    url: string,
    headers?: Record<string, string>,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse> {
    return this.makeRequest(request, { url, method: 'GET', headers, params });
  }

  /**
   * POST request
   */
  static async post(
    request: APIRequestContext,
    url: string,
    body: Record<string, unknown> | string | unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse> {
    return this.makeRequest(request, { url, method: 'POST', body, headers });
  }

  /**
   * PUT request
   */
  static async put(
    request: APIRequestContext,
    url: string,
    body: Record<string, unknown> | string | unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse> {
    return this.makeRequest(request, { url, method: 'PUT', body, headers });
  }

  /**
   * PATCH request
   */
  static async patch(
    request: APIRequestContext,
    url: string,
    body: Record<string, unknown> | string | unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse> {
    return this.makeRequest(request, { url, method: 'PATCH', body, headers });
  }

  /**
   * DELETE request
   */
  static async delete(
    request: APIRequestContext,
    url: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse> {
    return this.makeRequest(request, { url, method: 'DELETE', headers });
  }

  /**
   * Log response details for debugging
   */
  static logResponse<T>(response: ApiResponse<T>): void {
    console.log('=== API Response Details ===');
    console.log(`Status: ${response.status}`);
    console.log(`Duration: ${response.duration}ms`);
    console.log(`Body: ${JSON.stringify(response.body, null, 2)}`);
  }

  /**
   * Make a login API request with proper typing
   */
  static async makeLoginRequest(
    request: APIRequestContext,
    options: Omit<RequestOptions, 'method'>
  ): Promise<ApiResponse<LoginResponseBody>> {
    return this.makeRequest<LoginResponseBody>(request, { ...options, method: 'POST' });
  }

  /**
   * Make an OTP verification API request with proper typing
   */
  static async makeOtpVerificationRequest(
    request: APIRequestContext,
    options: Omit<RequestOptions, 'method'>
  ): Promise<ApiResponse<OtpVerificationResponseBody>> {
    return this.makeRequest<OtpVerificationResponseBody>(request, { ...options, method: 'POST' });
  }
}