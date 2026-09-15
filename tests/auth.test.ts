import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from '../server/auth';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = 'a'.repeat(32);
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('password hashing', () => {
  it('hashes a password and verifies it back', async () => {
    const hash = await hashPassword('correct horse battery staple');
    expect(hash).not.toBe('correct horse battery staple');
    await expect(verifyPassword('correct horse battery staple', hash)).resolves.toBe(true);
    await expect(verifyPassword('wrong password', hash)).resolves.toBe(false);
  });
});

describe('admin session tokens', () => {
  it('carries a session version so sessions can be revoked server-side', async () => {
    const token = await createAdminSessionToken({
      sub: 'admin-1',
      email: 'a@b.com',
      name: 'Admin',
      role: 'ADMIN',
      sv: 7,
    });
    const session = await verifyAdminSessionToken(token);
    expect(session?.sv).toBe(7);
  });

  it('round-trips a signed session token', async () => {
    const token = await createAdminSessionToken({ sub: 'admin-1', email: 'a@b.com', name: 'Admin', role: 'ADMIN', sv: 1 });
    const session = await verifyAdminSessionToken(token);
    expect(session).toMatchObject({ sub: 'admin-1', email: 'a@b.com', sv: 1 });
  });

  it('rejects a tampered or garbage token', async () => {
    await expect(verifyAdminSessionToken('not-a-real-token')).resolves.toBeNull();
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await createAdminSessionToken({ sub: 'admin-1', email: 'a@b.com', name: 'Admin', role: 'ADMIN', sv: 1 });
    process.env.ADMIN_SESSION_SECRET = 'b'.repeat(32);
    await expect(verifyAdminSessionToken(token)).resolves.toBeNull();
  });
});
