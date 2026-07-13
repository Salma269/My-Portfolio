import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/auth';
import { getDb } from '../_lib/db';
import { getPortfolioContent } from '../_lib/content';
import { handleOptions, json, ok, sendError, setCors } from '../_lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    if (req.method !== 'GET') return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
    requireAdmin(req);
    const db = await getDb();
    const content = await getPortfolioContent(db, true);
    ok(res, { success: true, content });
  } catch (error) {
    sendError(res, error);
  }
}
