import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearSessionCookie, requireAdmin } from '../_lib/auth';
import { handleOptions, json, ok, sendError, setCors } from '../_lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    if (req.method !== 'POST') return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
    requireAdmin(req);
    clearSessionCookie(res);
    ok(res, { success: true });
  } catch (error) {
    sendError(res, error);
  }
}
