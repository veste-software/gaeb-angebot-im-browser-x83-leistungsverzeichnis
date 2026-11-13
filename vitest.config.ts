import { defineConfig } from 'vitest/config';

// `npm test`: everything except the XSD validation, which needs xmllint and the official
// schema files (see vitest.schema.config.ts and `npm run test:schema`).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'functions/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['tests/schema/**', 'node_modules/**', 'dist/**'],
  },
});
