/**
 * Global teardown file for Playwright tests
 * Runs once after all tests
 */

async function globalTeardown() {
  // Clean up any global test data or configurations here
  console.log('🧹 Cleaning up after Playwright API tests...');

  // You can add any global cleanup logic here, such as:
  // - Cleaning up test databases
  // - Deleting test users
  // - Stopping external services
  // - Clearing caches

  console.log('✅ Global teardown completed');
}

export default globalTeardown;