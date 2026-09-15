import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'prisma/migrations/**', 'public/mockServiceWorker.js'],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];
