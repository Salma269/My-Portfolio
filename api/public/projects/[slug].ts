import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_lib/db';
import { handleOptions, json, ok, sendError, setCors } from '../../_lib/http';
import { normalizeDoc } from '../../_lib/content';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    if (req.method !== 'GET') return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
    const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug;
    if (!slug) return json(res, 400, { success: false, code: 'MISSING_SLUG' });
    const db = await getDb();
    const project = await db.collection('projects').findOne({ slug, visible: true, published: true });
    if (!project) return json(res, 404, { success: false, code: 'NOT_FOUND' });
    ok(res, { success: true, project: normalizeDoc(project) });
  } catch (error) {
    sendError(res, error);
  }
}
