import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../_lib/auth';
import { handleOptions, json, ok, sendError, setCors } from '../_lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    if (req.method !== 'GET') return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
    const session = getSession(req);
    ok(res, { authenticated: Boolean(session), email: session?.email });
  } catch (error) {
    sendError(res, error);
  }
}
