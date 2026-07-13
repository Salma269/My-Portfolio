import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db';
import { getPortfolioContent } from '../_lib/content';
import { handleOptions, ok, sendError, setCors } from '../_lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    if (req.method !== 'GET') return res.status(405).json({ success: false, code: 'METHOD_NOT_ALLOWED' });
    const db = await getDb();
    const content = await getPortfolioContent(db, false);
    ok(res, { success: true, content });
  } catch (error) {
    sendError(res, error);
  }
}
