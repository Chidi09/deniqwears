import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: { environment: 'node', include: ['audit/*.test.ts', 'audit/*.test.tsx'] },
  resolve: { alias: { '@': path.resolve(import.meta.dirname, '..') } },
});
