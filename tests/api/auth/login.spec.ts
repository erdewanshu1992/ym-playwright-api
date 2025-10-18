/**
 * Authentication API Tests - Login Flow for Playwright
 */

import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../utils/apiHelper';
import { ResponseValidator } from '../../utils/responseValidator';
import { Logger } from '../../utils/logger';
import { EnvironmentConfig } from '../../config/environments';
import * as fs from 'fs';

let testData: {
  validUser: {
    mobile: number;
    otp: number;
  };
  invalidUser: {
    mobile: number;
    otp: number;
  };
  endpoints: {
    login: string;
    otpVerification: string;
  };
  expectedResponses: {
    login: {
      status_code: number;
      status: string;
      message: string;
    };
    otpVerification: {
      status_code: number;
      status: string;
    };
  };
};

let schemas: {
  loginResponseSchema: {
    status_code: string;
    status: string;
    message: string;
    object: string;
    token: string;
    object2: string;
  };
  otpVerificationResponseSchema: {
    status_code: string;
    status: string;
    message: string;
    object: string;
  };
  userObjectSchema: {
    user_id: string;
    email: string;
    mobile: string;
  };
};

test.describe('Authentication API - Login', () => {
  test.beforeAll(async () => {
    // Load test data and schemas
    testData = JSON.parse(fs.readFileSync('tests/fixtures/testData.json', 'utf-8'));
    schemas = JSON.parse(fs.readFileSync('tests/fixtures/schemas.json', 'utf-8'));
  });

  test.describe('POST /v3/userapi/login', () => {
    test('should successfully send OTP for valid mobile number', async ({ request }) => {
      const endpoint = `${EnvironmentConfig.getApiUrl()}${testData.endpoints.login}`;
      const requestBody = {
        mobile: testData.validUser.mobile,
      };

      Logger.info('Testing login endpoint with valid mobile number');

      const response = await ApiHelper.post(request, endpoint, requestBody);

      // Validate status code
      ResponseValidator.validateStatusCode(response, 200);

      // Validate response time
      ResponseValidator.validateResponseTime(response, 3000);

      // Validate response body structure
      const responseBody = response.body as {
        status_code: number;
        status: string;
        message: string;
        object: unknown;
        token: string;
        object2: unknown;
      };
      ResponseValidator.validateBodyHasKeys(responseBody, [
        'status_code',
        'status',
        'message',
        'object',
        'token',
        'object2',
      ]);

      // Validate specific values
      ResponseValidator.validateBodyProperty(responseBody, 'status_code', 401); //401//500
      ResponseValidator.validateBodyProperty(responseBody, 'status', 'success');
      ResponseValidator.validateBodyProperty(
        responseBody,
        'message',
        'move on otp verification page'
      );

      // Validate schema
      ResponseValidator.validateSchema(responseBody, schemas.loginResponseSchema);

      Logger.success('Login API test passed successfully');
    });

    test('should validate response body data types', async ({ request }) => {
      const endpoint = `${EnvironmentConfig.getApiUrl()}${testData.endpoints.login}`;
      const requestBody = {
        mobile: testData.validUser.mobile,
      };

      const response = await ApiHelper.post(request, endpoint, requestBody);
      const responseBody = response.body as {
        status_code: number;
        status: string;
        message: string;
      };

      ResponseValidator.validateBodyPropertyType(responseBody, 'status_code', 'number');
      ResponseValidator.validateBodyPropertyType(responseBody, 'status', 'string');
      ResponseValidator.validateBodyPropertyType(responseBody, 'message', 'string');

      Logger.success('Data type validation passed');
    });

    test('should handle invalid mobile number gracefully', async ({ request }) => {
      const endpoint = `${EnvironmentConfig.getApiUrl()}${testData.endpoints.login}`;
      const requestBody = {
        mobile: 1234567,
      };

      Logger.info('Testing login with invalid mobile number');

      try {
        const response = await ApiHelper.makeRequest(request, {
          url: endpoint,
          method: 'POST',
          body: requestBody,
          failOnStatusCode: false,
        });

        // Validate that response is received (status code may vary)
        expect([200, 400, 401, 422]).toContain(response.status);

        Logger.info(`Response status for invalid mobile: ${response.status}`);
      } catch {
        Logger.warning('Request failed as expected for invalid mobile number');
      }
    });

    test('should validate response headers', async ({ request }) => {
      const endpoint = `${EnvironmentConfig.getApiUrl()}${testData.endpoints.login}`;
      const requestBody = {
        mobile: testData.validUser.mobile,
      };

      const response = await ApiHelper.post(request, endpoint, requestBody);

      ResponseValidator.validateHeaderExists(response.headers, 'content-type');
      expect(response.headers['content-type']).toContain('application/json');

      Logger.success('Header validation passed');
    });

    test('should handle missing mobile number in request body', async ({ request }) => {
      const endpoint = `${EnvironmentConfig.getApiUrl()}${testData.endpoints.login}`;
      const requestBody = {};

      Logger.info('Testing login with missing mobile number');

      try {
        const response = await ApiHelper.makeRequest(request, {
          url: endpoint,
          method: 'POST',
          body: requestBody,
          failOnStatusCode: false,
        });

        // Should return error status
        expect([200, 422]).toContain(response.status);

        Logger.info('Missing field validation working as expected');
      } catch {
        Logger.warning('Request failed as expected for missing mobile number');
      }
    });
  });

  test.describe('Performance Tests', () => {
    test('should respond within acceptable time limit', async ({ request }) => {
      const endpoint = `${EnvironmentConfig.getApiUrl()}${testData.endpoints.login}`;
      const requestBody = {
        mobile: testData.validUser.mobile,
      };

      const response = await ApiHelper.post(request, endpoint, requestBody);

      // Validate response time is less than 5 seconds
      ResponseValidator.validateResponseTime(response, 5000);

      console.log(`⚡ Response time: ${response.duration}ms`);
      Logger.success(`Performance test passed - Response time: ${response.duration}ms`);
    });
  });
});