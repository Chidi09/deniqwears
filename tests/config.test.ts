import { describe, it, expect, afterEach, vi } from 'vitest';
import { getAppUrl } from '../server/config';

// vi.stubEnv is used rather than assigning process.env.NODE_ENV directly:
// NODE_ENV is typed read-only, and assigning to it fails `tsc` (which Next
// also runs during a production build).
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getAppUrl', () => {
  it('uses the configured URL and strips trailing slashes', () => {
    vi.stubEnv('APP_URL', 'https://deniqwears.example/');
    expect(getAppUrl()).toBe('https://deniqwears.example');
  });

  it('falls back to localhost in development', () => {
    vi.stubEnv('APP_URL', '');
    vi.stubEnv('NODE_ENV', 'development');
    expect(getAppUrl()).toBe('http://localhost:3000');
  });

  it('refuses to guess in production — a wrong callback URL silently breaks paid checkouts', () => {
    vi.stubEnv('APP_URL', '');
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => getAppUrl()).toThrow(/APP_URL is not set/);
  });
});
