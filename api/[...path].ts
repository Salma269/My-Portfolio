import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, del } from '@vercel/blob';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { getDb } from './_lib/db.js';
import { clearSessionCookie, requireAdmin, setSessionCookie, signSession, validateAdmin } from './_lib/auth.js';
import { getPortfolioContent, isCollectionName, normalizeDoc, normalizeDocs, withAudit, withUpdateAudit } from './_lib/content.js';
import { env } from './_lib/env.js';
import { cleanString, getIp, handleOptions, hashIp, HttpError, json, noContent, ok, created, parseBody, requireJson, sendError, setCors } from './_lib/http.js';
import { sendContactEmail } from './_lib/mailer.js';
import { rateLimit } from './_lib/rateLimit.js';
import { approveSchema, contactSchema, entitySchemas, loginSchema, reorderSchema, siteSettingsPatchSchema } from './_lib/schemas.js';

const uploadSchema = z.object({
  projectId: z.string().min(1),
  purpose: z.enum(['cover', 'gallery']),
  fileName: z.string().min(1).max(180),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  fileBase64: z.string().min(1),
  alt: z.object({ en: z.string().min(1).max(200), ar: z.string().max(200).default('') }),
});

const deleteMediaSchema = z.object({ pathname: z.string().min(1), projectId: z.string().optional(), imageId: z.string().optional() }).partial().strict();

function routeParts(req: VercelRequest): string[] {
  const path = req.query.path;
  if (Array.isArray(path)) return path.filter(Boolean);
  return path ? [path] : [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    const parts = routeParts(req);
    const route = parts.join('/');

    if (route === 'public/content' && req.method === 'GET') return getPublicContent(res);
    if (parts[0] === 'public' && parts[1] === 'projects' && parts[2] && req.method === 'GET') return getPublicProject(res, parts[2]);

    if (route === 'auth/login' && req.method === 'POST') return login(req, res);
    if (route === 'auth/logout' && req.method === 'POST') return logout(req, res);
    if (route === 'auth/session' && req.method === 'GET') return session(req, res);

    if (route === 'contact' && req.method === 'POST') return contact(req, res);

    if (route === 'admin/content' && req.method === 'GET') return adminContent(req, res);
    if (route === 'admin/site-settings' && req.method === 'PATCH') return patchSiteSettings(req, res);
    if (route === 'admin/locale/approve' && req.method === 'PATCH') return approveLocale(req, res);
    if (route === 'admin/locale/generate-draft' && req.method === 'POST') return generateDraft(req, res);
    if (route === 'admin/media/upload' && req.method === 'POST') return uploadMedia(req, res);
    if (parts[0] === 'admin' && parts[1] === 'media' && req.method === 'DELETE') return deleteMedia(req, res, parts[2]);

    if (parts[0] === 'admin' && parts[1] && isCollectionName(parts[1])) {
      if (parts.length === 2) return collectionRoot(req, res, parts[1]);
      if (parts[2] === 'reorder' && req.method === 'PATCH') return reorderCollection(req, res, parts[1]);
      if (parts[2]) return collectionItem(req, res, parts[1], parts[2]);
    }

    return json(res, 404, { success: false, code: 'NOT_FOUND' });
  } catch (error) {
    sendError(res, error);
  }
}

async function getPublicContent(res: VercelResponse) {
  const db = await getDb();
  ok(res, { success: true, content: await getPortfolioContent(db, false) });
}

async function getPublicProject(res: VercelResponse, slug: string) {
  const db = await getDb();
  const project = await db.collection('projects').findOne({ slug, visible: true, published: true });
  if (!project) return json(res, 404, { success: false, code: 'NOT_FOUND' });
  ok(res, { success: true, project: normalizeDoc(project) });
}

async function login(req: VercelRequest, res: VercelResponse) {
  requireJson(req);
  rateLimit(`login:${getIp(req)}`, 5, 15 * 60 * 1000);
  const body = loginSchema.parse(await parseBody(req));
  const db = await getDb();
  const user = await validateAdmin(db, body.email, body.password);
  if (!user) return json(res, 401, { success: false, code: 'INVALID_CREDENTIALS' });
  setSessionCookie(res, signSession(user));
  ok(res, { success: true, email: user.email });
}

function logout(req: VercelRequest, res: VercelResponse) {
  requireAdmin(req);
  clearSessionCookie(res);
  ok(res, { success: true });
}

function session(req: VercelRequest, res: VercelResponse) {
  const admin = (() => {
    try { return requireAdmin(req); } catch { return null; }
  })();
  ok(res, { authenticated: Boolean(admin), email: admin?.email });
}

async function contact(req: VercelRequest, res: VercelResponse) {
  requireJson(req);
  const ip = getIp(req);
  rateLimit(`contact:${ip}`, 3, 60 * 60 * 1000);
  const body = contactSchema.parse(await parseBody(req));
  if (body._website || body.honeypot) return ok(res, { success: true });
  const message = { name: cleanString(body.name), email: cleanString(body.email), subject: cleanString(body.subject), message: body.message.trim() };
  const db = await getDb();
  let status: 'received' | 'emailed' | 'failed' = 'received';
  try {
    await sendContactEmail(message);
    status = 'emailed';
  } catch (error) {
    status = 'failed';
    console.error('contact email failed', error);
  }
  await db.collection('contactMessages').insertOne({ ...message, ipHash: hashIp(ip), userAgent: req.headers['user-agent'], status, createdAt: new Date() });
  if (status === 'failed') return json(res, 502, { success: false, code: 'SEND_FAILED' });
  ok(res, { success: true });
}

async function adminContent(req: VercelRequest, res: VercelResponse) {
  requireAdmin(req);
  const db = await getDb();
  ok(res, { success: true, content: await getPortfolioContent(db, true) });
}

async function patchSiteSettings(req: VercelRequest, res: VercelResponse) {
  requireJson(req);
  const admin = requireAdmin(req);
  const patch = siteSettingsPatchSchema.parse(await parseBody(req));
  const db = await getDb();
  await db.collection<Record<string, unknown> & { _id: string }>('siteSettings').updateOne({ _id: 'main' }, { $set: withUpdateAudit(patch, admin.email) }, { upsert: true });
  const doc = await db.collection<Record<string, unknown> & { _id: string }>('siteSettings').findOne({ _id: 'main' });
  ok(res, { success: true, siteSettings: normalizeDoc(doc) });
}

async function approveLocale(req: VercelRequest, res: VercelResponse) {
  requireJson(req);
  const admin = requireAdmin(req);
  const body = approveSchema.parse(await parseBody(req));
  const db = await getDb();
  if (body.entity === 'siteSettings') {
    await db.collection<Record<string, unknown> & { _id: string }>('siteSettings').updateOne({ _id: 'main' }, { $set: { 'localeStatus.ar': 'approved', updatedAt: new Date(), updatedBy: admin.email } });
  } else {
    if (!body.id || !ObjectId.isValid(body.id)) return json(res, 400, { success: false, code: 'INVALID_ID' });
    await db.collection(body.entity).updateOne({ _id: new ObjectId(body.id) }, { $set: { 'localeStatus.ar': 'approved', updatedAt: new Date(), updatedBy: admin.email } });
  }
  ok(res, { success: true });
}

function generateDraft(req: VercelRequest, res: VercelResponse) {
  requireAdmin(req);
  ok(res, { success: true, code: 'DRAFTS_ALREADY_SEEDED', message: 'Arabic drafts are seeded from the CV. Connect a translation provider later to regenerate drafts automatically.' });
}

async function collectionRoot(req: VercelRequest, res: VercelResponse, entity: keyof typeof entitySchemas) {
  const admin = requireAdmin(req);
  const db = await getDb();
  const collection = db.collection(entity);
  if (req.method === 'GET') {
    const docs = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
    return ok(res, { success: true, items: normalizeDocs(docs) });
  }
  if (req.method === 'POST') {
    requireJson(req);
    const body = entitySchemas[entity].parse(await parseBody(req));
    const result = await collection.insertOne(withAudit(body, admin.email));
    const doc = await collection.findOne({ _id: result.insertedId });
    return created(res, { success: true, item: normalizeDoc(doc) });
  }
  return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
}

async function reorderCollection(req: VercelRequest, res: VercelResponse, entity: keyof typeof entitySchemas) {
  requireJson(req);
  const admin = requireAdmin(req);
  const { orderedIds } = reorderSchema.parse(await parseBody(req));
  const db = await getDb();
  await Promise.all(orderedIds.map((id, index) => db.collection(entity).updateOne({ _id: new ObjectId(id) }, { $set: withUpdateAudit({ order: index + 1 }, admin.email) })));
  ok(res, { success: true });
}

async function collectionItem(req: VercelRequest, res: VercelResponse, entity: keyof typeof entitySchemas, id: string) {
  const admin = requireAdmin(req);
  if (!ObjectId.isValid(id)) return json(res, 400, { success: false, code: 'INVALID_ID' });
  const db = await getDb();
  const _id = new ObjectId(id);
  if (req.method === 'PATCH') {
    requireJson(req);
    const patch = entitySchemas[entity].partial().strict().parse(await parseBody(req));
    await db.collection(entity).updateOne({ _id }, { $set: withUpdateAudit(patch, admin.email) });
    const doc = await db.collection(entity).findOne({ _id });
    return ok(res, { success: true, item: normalizeDoc(doc) });
  }
  if (req.method === 'DELETE') {
    await db.collection(entity).deleteOne({ _id });
    return noContent(res);
  }
  return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
}

async function uploadMedia(req: VercelRequest, res: VercelResponse) {
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
  const blob = await put(`projects/${body.projectId}/${id}.webp`, optimized, { access: 'public', token: env.blobToken, contentType: 'image/webp' });
  const metadata = await sharp(optimized).metadata();
  const projectImage = { id, blobUrl: blob.url, pathname: blob.pathname, alt: body.alt, order: Date.now(), width: metadata.width, height: metadata.height, mimeType: 'image/webp' };
  const db = await getDb();
  const _id = new ObjectId(body.projectId);
  if (body.purpose === 'cover') await db.collection('projects').updateOne({ _id }, { $set: { coverImage: projectImage, updatedAt: new Date() } });
  else await db.collection('projects').updateOne({ _id }, { $push: { gallery: projectImage }, $set: { updatedAt: new Date() } } as never);
  ok(res, { success: true, image: projectImage });
}

async function deleteMedia(req: VercelRequest, res: VercelResponse, fallbackPathname?: string) {
  requireJson(req);
  requireAdmin(req);
  if (!env.blobToken) throw new HttpError(500, 'BLOB_NOT_CONFIGURED', 'Vercel Blob token is missing.');
  const body = deleteMediaSchema.parse(await parseBody(req));
  const pathname = body.pathname ?? fallbackPathname;
  if (!pathname) throw new HttpError(400, 'MISSING_PATHNAME', 'Blob pathname is required.');
  await del(pathname, { token: env.blobToken });
  if (body.projectId && ObjectId.isValid(body.projectId)) {
    const db = await getDb();
    await db.collection('projects').updateOne({ _id: new ObjectId(body.projectId) }, { $pull: { gallery: { id: body.imageId, pathname } }, $set: { updatedAt: new Date() } } as never);
  }
  noContent(res);
}
