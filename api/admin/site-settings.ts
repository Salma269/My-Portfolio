import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/auth';
import { getDb } from '../_lib/db';
import { normalizeDoc, withUpdateAudit } from '../_lib/content';
import { handleOptions, json, ok, parseBody, requireJson, sendError, setCors } from '../_lib/http';
import { siteSettingsPatchSchema } from '../_lib/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    if (req.method !== 'PATCH') return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
    requireJson(req);
    const session = requireAdmin(req);
    const patch = siteSettingsPatchSchema.parse(await parseBody(req));
    const db = await getDb();
    await db.collection<Record<string, unknown> & { _id: string }>('siteSettings').updateOne({ _id: 'main' }, { $set: withUpdateAudit(patch, session.email) }, { upsert: true });
    const doc = await db.collection<Record<string, unknown> & { _id: string }>('siteSettings').findOne({ _id: 'main' });
    ok(res, { success: true, siteSettings: normalizeDoc(doc) });
  } catch (error) {
    sendError(res, error);
  }
}
