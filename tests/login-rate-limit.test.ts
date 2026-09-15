import { describe, it, expect } from 'vitest';
import { db } from '../server/db';

// Integration test against the real local Postgres (DATABASE_URL from .env).
// Skips itself gracefully if no database is reachable, rather than failing
// CI environments that haven't provisioned one.
const hasDb = !!process.env.DATABASE_URL;
const describeIfDb = hasDb ? describe : describe.skip;

// Rate-limit rows are matched by email OR ip, and nothing prunes them between
// runs — so each run needs addresses it is guaranteed not to share with a
// previous one.
let counter = 0;
function uniqueSuffix(): string {
  counter += 1;
  return `${Date.now() % 100000}-${counter}`;
}

describeIfDb('login rate limiting (db-backed)', () => {
  it('counts recent failed attempts and ignores old or successful ones', async () => {
    const email = `ratelimit-test-${Date.now()}@example.com`;
    // Unique per run: a random IP from a small pool collides with rows left
    // by earlier runs and makes the count assertion flaky.
    const ip = `10.0.0.${uniqueSuffix()}`;

    expect(await db.countRecentFailedLoginAttempts(email, ip, 15)).toBe(0);

    await db.recordLoginAttempt(email, ip, false);
    await db.recordLoginAttempt(email, ip, false);
    await db.recordLoginAttempt(email, ip, true); // success shouldn't count

    expect(await db.countRecentFailedLoginAttempts(email, ip, 15)).toBe(2);
  });

  it('buckets attempts by email OR ip, so either can trigger the limit', async () => {
    const email = `ratelimit-test-${Date.now()}@example.com`;
    const sharedIp = `10.0.1.${uniqueSuffix()}`;

    // Same IP, different (attacker-guessed) emails.
    await db.recordLoginAttempt(`${email}-a`, sharedIp, false);
    await db.recordLoginAttempt(`${email}-b`, sharedIp, false);

    expect(await db.countRecentFailedLoginAttempts('someone-else@example.com', sharedIp, 15)).toBe(2);
  });
});
