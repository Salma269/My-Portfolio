import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { parseCookie, stringifySetCookie } from 'cookie';
import jwt from 'jsonwebtoken';
import type { Db } from 'mongodb';
import { env, requireEnv } from './env.js';
import { HttpError } from './http.js';

const COOKIE_NAME = 'salma_admin_session';
const EIGHT_HOURS = 60 * 60 * 8;

type SessionPayload = {
  sub: string;
  username: string;
  email?: string;
};

type AdminUserDoc = {
  _id: { toString(): string };
  username?: string;
  email?: string;
  passwordHash: string;
};

async function resolveAdminPasswordHash(): Promise<string | null> {
  if (env.adminPasswordHash) return env.adminPasswordHash;
  if (env.adminPassword) return bcrypt.hash(env.adminPassword, 12);
  return null;
}

export async function bootstrapAdmin(db: Db): Promise<void> {
  const username = env.adminUsername?.toLowerCase();
  const passwordHash = await resolveAdminPasswordHash();
  if (!username || !passwordHash) return;

  await db.collection('adminUsers').updateOne(
    { username },
    {
      $set: {
        username,
        email: env.adminEmail?.toLowerCase(),
        passwordHash,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );
}

export async function validateAdmin(db: Db, usernameOrEmail: string, password: string): Promise<{ id: string; username: string; email?: string } | null> {
  await bootstrapAdmin(db);
  const identifier = usernameOrEmail.toLowerCase();
  const user = await db.collection('adminUsers').findOne<AdminUserDoc>({
    $or: [{ username: identifier }, { email: identifier }],
  });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  await db.collection('adminUsers').updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
  return { id: user._id.toString(), username: user.username ?? user.email ?? identifier, email: user.email };
}

export function signSession(user: { id: string; username: string; email?: string }): string {
  return jwt.sign({ sub: user.id, username: user.username, email: user.email }, requireEnv('authSecret'), { expiresIn: EIGHT_HOURS });
}

export function setSessionCookie(res: VercelResponse, token: string): void {
  res.setHeader(
    'Set-Cookie',
    stringifySetCookie({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: EIGHT_HOURS,
    }),
  );
}

export function clearSessionCookie(res: VercelResponse): void {
  res.setHeader(
    'Set-Cookie',
    stringifySetCookie({
      name: COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    }),
  );
}

export function getSession(req: VercelRequest): SessionPayload | null {
  const cookies = parseCookie(req.headers.cookie ?? '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, requireEnv('authSecret')) as SessionPayload;
  } catch {
    return null;
  }
}

export function requireAdmin(req: VercelRequest): SessionPayload {
  const session = getSession(req);
  if (!session) throw new HttpError(401, 'UNAUTHENTICATED', 'Admin authentication required.');
  return session;
}
