import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/auth';
import { getDb } from '../_lib/db';
import { isCollectionName, normalizeDoc, normalizeDocs, withAudit } from '../_lib/content';
import { created, handleOptions, json, ok, parseBody, requireJson, sendError, setCors } from '../_lib/http';
import { entitySchemas } from '../_lib/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    const entity = Array.isArray(req.query.entity) ? req.query.entity[0] : req.query.entity;
    if (!entity || !isCollectionName(entity)) return json(res, 404, { success: false, code: 'UNKNOWN_ENTITY' });
    const session = requireAdmin(req);
    const db = await getDb();
    const collection = db.collection(entity);

    if (req.method === 'GET') {
      const docs = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
      return ok(res, { success: true, items: normalizeDocs(docs) });
    }

    if (req.method === 'POST') {
      requireJson(req);
      const schema = entitySchemas[entity];
      const body = schema.parse(await parseBody(req));
      const result = await collection.insertOne(withAudit(body, session.email));
      const doc = await collection.findOne({ _id: result.insertedId });
      return created(res, { success: true, item: normalizeDoc(doc) });
    }

    return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
  } catch (error) {
    sendError(res, error);
  }
}
