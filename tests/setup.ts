import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../src/mocks/server';

/**
 * Guard against running destructive database tests against a real database.
 *
 * The integration tests create and delete rows using whatever DATABASE_URL is
 * configured — which is the application's own database. That is fine for a
 * local dev database and catastrophic for anything else, so anything that
 * looks like a production/hosted database is refused outright. Set
 * ALLOW_DB_TESTS=1 to override deliberately.
 */
function assertSafeTestDatabase(): void {
  const url = process.env.DATABASE_URL;
  if (!url || process.env.ALLOW_DB_TESTS === '1') return;

  const isLocal = /@(localhost|127\.0\.0\.1|host\.docker\.internal)[:/]/.test(url);
  const looksLikeTestDb = /_test\b|\btest_/.test(url);

  if (!isLocal && !looksLikeTestDb) {
    throw new Error(
      `Refusing to run database tests against "${url.replace(/:[^:@/]+@/, ':***@')}". ` +
        'These tests create and delete rows. Point DATABASE_URL at a local or _test database, ' +
        'or set ALLOW_DB_TESTS=1 if you are certain.'
    );
  }
}

beforeAll(() => {
  assertSafeTestDatabase();
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
