import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db';
import { loginSchema } from '../_lib/schemas';
import { getIp, handleOptions, json, ok, parseBody, requireJson, sendError, setCors } from '../_lib/http';
import { rateLimit } from '../_lib/rateLimit';
import { setSessionCookie, signSession, validateAdmin } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    if (req.method !== 'POST') return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
    requireJson(req);
    rateLimit(`login:${getIp(req)}`, 5, 15 * 60 * 1000);
    const body = loginSchema.parse(await parseBody(req));
    const db = await getDb();
    const user = await validateAdmin(db, body.email, body.password);
    if (!user) return json(res, 401, { success: false, code: 'INVALID_CREDENTIALS' });
    setSessionCookie(res, signSession(user));
    ok(res, { success: true, email: user.email });
  } catch (error) {
    sendError(res, error);
  }
}
