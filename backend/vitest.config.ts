import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

// Load test environment variables before tests
config({ path: '.env.test' });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/lib/agents/__tests__/setup.ts'],
    // Increase timeout for tests that may involve long-running operations
    // (even with mocks, we want to ensure tests don't timeout prematurely)
    testTimeout: 30000, // 30 seconds per test (mocks are fast, but be generous)
    hookTimeout: 30000, // 30 seconds for setup/teardown
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/__tests__/mocks/**',
      ],
    },
    mockReset: true,
    restoreMocks: true,
  },
});
