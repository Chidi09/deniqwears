'use client';

import React, { useEffect, useState } from 'react';

const MOCKING_ENABLED =
  process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' && process.env.NODE_ENV !== 'production';

/**
 * Starts the MSW browser worker in development when
 * NEXT_PUBLIC_API_MOCKING=enabled, so the storefront can be developed
 * without a configured DATABASE_URL.
 *
 * Children are held back until the worker is running: otherwise the first
 * data queries race the worker, reach the real API (and whatever database it
 * points at), and that response sits in the query cache. Without the flag
 * this renders children immediately and does nothing else.
 */
export function MswInit({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!MOCKING_ENABLED);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' && process.env.NODE_ENV === 'production') {
      // Belt and braces with the server-side guard in instrumentation.ts: mock
      // checkout must never replace real checkout for a real customer.
      console.error('NEXT_PUBLIC_API_MOCKING is enabled in a production build; refusing to start mocks.');
      return;
    }
    if (!MOCKING_ENABLED) return;
    import('./browser')
      .then(({ worker }) => worker.start({ onUnhandledRequest: 'bypass' }))
      .finally(() => setReady(true));
  }, []);

  return ready ? <>{children}</> : null;
}
