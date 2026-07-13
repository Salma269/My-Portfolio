import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '../../_lib/auth';
import { getDb } from '../../_lib/db';
import { isCollectionName, normalizeDoc, withUpdateAudit } from '../../_lib/content';
import { handleOptions, json, noContent, ok, parseBody, requireJson, sendError, setCors } from '../../_lib/http';
import { entitySchemas, reorderSchema } from '../../_lib/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    const entity = Array.isArray(req.query.entity) ? req.query.entity[0] : req.query.entity;
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!entity || !isCollectionName(entity) || !id) return json(res, 404, { success: false, code: 'UNKNOWN_ENTITY' });
    const session = requireAdmin(req);
    const db = await getDb();
    const collection = db.collection(entity);

    if (id === 'reorder') {
      if (req.method !== 'PATCH') return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
      requireJson(req);
      const { orderedIds } = reorderSchema.parse(await parseBody(req));
      await Promise.all(
        orderedIds.map((orderedId, index) => collection.updateOne({ _id: new ObjectId(orderedId) }, { $set: withUpdateAudit({ order: index + 1 }, session.email) })),
      );
      return ok(res, { success: true });
    }

    if (!ObjectId.isValid(id)) return json(res, 400, { success: false, code: 'INVALID_ID' });
    const _id = new ObjectId(id);

    if (req.method === 'PATCH') {
      requireJson(req);
      const schema = entitySchemas[entity].partial().strict();
      const patch = schema.parse(await parseBody(req));
      await collection.updateOne({ _id }, { $set: withUpdateAudit(patch, session.email) });
      const doc = await collection.findOne({ _id });
      return ok(res, { success: true, item: normalizeDoc(doc) });
    }

    if (req.method === 'DELETE') {
      await collection.deleteOne({ _id });
      return noContent(res);
    }

    return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
  } catch (error) {
    sendError(res, error);
  }
}
