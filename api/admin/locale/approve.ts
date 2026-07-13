import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '../../_lib/auth';
import { getDb } from '../../_lib/db';
import { handleOptions, json, ok, parseBody, requireJson, sendError, setCors } from '../../_lib/http';
import { approveSchema } from '../../_lib/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    if (req.method !== 'PATCH') return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
    requireJson(req);
    const session = requireAdmin(req);
    const body = approveSchema.parse(await parseBody(req));
    const db = await getDb();
    if (body.entity === 'siteSettings') {
      await db.collection<Record<string, unknown> & { _id: string }>('siteSettings').updateOne({ _id: 'main' }, { $set: { 'localeStatus.ar': 'approved', updatedAt: new Date(), updatedBy: session.email } });
    } else {
      if (!body.id || !ObjectId.isValid(body.id)) return json(res, 400, { success: false, code: 'INVALID_ID' });
      await db.collection(body.entity).updateOne({ _id: new ObjectId(body.id) }, { $set: { 'localeStatus.ar': 'approved', updatedAt: new Date(), updatedBy: session.email } });
    }
    ok(res, { success: true });
  } catch (error) {
    sendError(res, error);
  }
}
