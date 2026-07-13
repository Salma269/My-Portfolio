import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { parseCookie, stringifySetCookie } from 'cookie';
import jwt from 'jsonwebtoken';
import type { Db } from 'mongodb';
import { env, requireEnv } from './env';
import { HttpError } from './http';

const COOKIE_NAME = 'salma_admin_session';
const EIGHT_HOURS = 60 * 60 * 8;

type SessionPayload = {
  sub: string;
  email: string;
};

export async function bootstrapAdmin(db: Db): Promise<void> {
  const count = await db.collection('adminUsers').countDocuments();
  if (count > 0) return;
  if (!env.adminEmail || !env.adminPasswordHash) return;
  await db.collection('adminUsers').insertOne({
    email: env.adminEmail.toLowerCase(),
    passwordHash: env.adminPasswordHash,
    createdAt: new Date(),
  });
}

export async function validateAdmin(db: Db, email: string, password: string): Promise<{ id: string; email: string } | null> {
  await bootstrapAdmin(db);
  const user = await db.collection('adminUsers').findOne<{ _id: { toString(): string }; email: string; passwordHash: string }>({ email: email.toLowerCase() });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  await db.collection('adminUsers').updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
  return { id: user._id.toString(), email: user.email };
}

export function signSession(user: { id: string; email: string }): string {
  return jwt.sign({ sub: user.id, email: user.email }, requireEnv('authSecret'), { expiresIn: EIGHT_HOURS });
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
