import { defineConfig } from 'vitest/config';

// `npm run test:schema`: validates fixtures and exported X84 files with
// `xmllint --noout --schema <official XSD>`. It FAILS with a clear message when xmllint or the
// official XSDs in tests/fixtures/gaeb/official/ are missing; it never skips silently.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/schema/**/*.test.ts'],
    passWithNoTests: false,
  },
});
