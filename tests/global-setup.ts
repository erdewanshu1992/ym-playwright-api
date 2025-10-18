/**
 * Global setup file for Playwright tests
 * Runs once before all tests
 */

async function globalSetup() {
  // Set up any global test data or configurations here
  console.log('🚀 Setting up Playwright API tests...');

  // You can add any global setup logic here, such as:
  // - Setting up test databases
  // - Creating test users
  // - Initializing external services
  // - Loading test configurations

  console.log('✅ Global setup completed');
}

export default globalSetup;