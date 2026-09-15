'use client';

import { useEffect } from 'react';

/**
 * Starts the MSW browser worker in development when
 * NEXT_PUBLIC_API_MOCKING=enabled, so the storefront can be developed
 * without a configured DATABASE_URL. No-ops immediately (and is tree-shaken
 * out of any prod-optimized path) when the flag isn't set.
 */
export function MswInit() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled') return;
    // Belt and braces with the server-side guard in instrumentation.ts: mock
    // checkout must never replace real checkout for a real customer.
    if (process.env.NODE_ENV === 'production') {
      console.error('NEXT_PUBLIC_API_MOCKING is enabled in a production build — refusing to start mocks.');
      return;
    }
    import('./browser').then(({ worker }) => {
      worker.start({ onUnhandledRequest: 'bypass' });
    });
  }, []);

  return null;
}
