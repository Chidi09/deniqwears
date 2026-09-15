import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

export const ADMIN_SESSION_COOKIE_NAME = 'deniq_admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AdminSessionPayload {
  sub: string;
  email: string;
  name: string;
  role: 'ADMIN';
  /** Must still match the admin's stored sessionVersion to be accepted. */
  sv: number;
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET is not configured. Set it to a random string of at least 32 characters (e.g. `openssl rand -hex 32`).'
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role, sv: payload.sv })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifyAdminSessionToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') return null;
    // Validate the claim rather than synthesising it.
    if (payload.role !== 'ADMIN') return null;
    if (typeof payload.sv !== 'number') return null;

    return {
      sub: payload.sub,
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : '',
      role: 'ADMIN',
      sv: payload.sv,
    };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// A precomputed hash of a value nobody will ever type, run through bcrypt.compare
// when the email lookup misses, so a login attempt against a non-existent admin
// takes the same time as one against a real account (avoids email enumeration
// via response-time side channel).
export const DUMMY_PASSWORD_HASH = bcrypt.hashSync('deniq-nonexistent-account-placeholder', 12);
