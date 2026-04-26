import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
  },
  env: {
    ADMIN_EMAIL: 'admin@goalz-test.internal',
    ADMIN_PASSWORD: 'AdminPass123!',
    STAFF_EMAIL: 'staff@goalz-test.internal',
  },
});
