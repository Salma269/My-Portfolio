import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '../../_lib/auth';
import { getDb } from '../../_lib/db';
import { env } from '../../_lib/env';
import { handleOptions, HttpError, json, ok, parseBody, requireJson, sendError, setCors } from '../../_lib/http';

const uploadSchema = z.object({
  projectId: z.string().min(1),
  purpose: z.enum(['cover', 'gallery']),
  fileName: z.string().min(1).max(180),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  fileBase64: z.string().min(1),
  alt: z.object({ en: z.string().min(1).max(200), ar: z.string().max(200).default('') }),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    if (req.method !== 'POST') return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
    requireJson(req);
    requireAdmin(req);
    if (!env.blobToken) throw new HttpError(500, 'BLOB_NOT_CONFIGURED', 'Vercel Blob token is missing.');
    const body = uploadSchema.parse(await parseBody(req));
    if (!ObjectId.isValid(body.projectId)) throw new HttpError(400, 'INVALID_PROJECT_ID', 'Invalid project id.');
    const original = Buffer.from(body.fileBase64, 'base64');
    if (original.byteLength > 5 * 1024 * 1024) throw new HttpError(413, 'FILE_TOO_LARGE', 'Images must be under 5 MB.');

    const image = sharp(original, { failOn: 'error' });
    const meta = await image.metadata();
    if ((meta.width ?? 0) > 4096 || (meta.height ?? 0) > 4096) throw new HttpError(422, 'DIMENSIONS_TOO_LARGE', 'Image dimensions must be 4096px or less.');
    const optimized = await image.rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    const id = randomUUID();
    const pathname = `projects/${body.projectId}/${id}.webp`;
    const blob = await put(pathname, optimized, { access: 'public', token: env.blobToken, contentType: 'image/webp' });
    const metadata = await sharp(optimized).metadata();
    const projectImage = {
      id,
      blobUrl: blob.url,
      pathname: blob.pathname,
      alt: body.alt,
      order: Date.now(),
      width: metadata.width,
      height: metadata.height,
      mimeType: 'image/webp',
    };

    const db = await getDb();
    const _id = new ObjectId(body.projectId);
    if (body.purpose === 'cover') {
      await db.collection('projects').updateOne({ _id }, { $set: { coverImage: projectImage, updatedAt: new Date() } });
    } else {
      await db.collection('projects').updateOne({ _id }, { $push: { gallery: projectImage }, $set: { updatedAt: new Date() } } as never);
    }

    ok(res, { success: true, image: projectImage });
  } catch (error) {
    sendError(res, error);
  }
}
