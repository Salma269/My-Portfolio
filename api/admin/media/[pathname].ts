import type { VercelRequest, VercelResponse } from '@vercel/node';
import { del } from '@vercel/blob';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '../../_lib/auth';
import { getDb } from '../../_lib/db';
import { env } from '../../_lib/env';
import { handleOptions, HttpError, json, noContent, parseBody, requireJson, sendError, setCors } from '../../_lib/http';

const deleteSchema = z.object({ pathname: z.string().min(1), projectId: z.string().optional(), imageId: z.string().optional() }).strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    if (req.method !== 'DELETE') return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
    requireJson(req);
    requireAdmin(req);
    if (!env.blobToken) throw new HttpError(500, 'BLOB_NOT_CONFIGURED', 'Vercel Blob token is missing.');
    const fallback = Array.isArray(req.query.pathname) ? req.query.pathname[0] : req.query.pathname;
    const body = deleteSchema.partial().parse(await parseBody(req));
    const pathname = body.pathname ?? fallback;
    if (!pathname) throw new HttpError(400, 'MISSING_PATHNAME', 'Blob pathname is required.');
    await del(pathname, { token: env.blobToken });

    if (body.projectId && ObjectId.isValid(body.projectId)) {
      const db = await getDb();
      const _id = new ObjectId(body.projectId);
      await db.collection('projects').updateOne(
        { _id },
        {
          $pull: { gallery: { id: body.imageId, pathname } },
          $unset: { ...(body.imageId ? {} : { coverImage: '' }) },
          $set: { updatedAt: new Date() },
        } as never,
      );
    }
    noContent(res);
  } catch (error) {
    sendError(res, error);
  }
}
