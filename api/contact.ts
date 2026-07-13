import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_lib/db';
import { contactSchema } from './_lib/schemas';
import { cleanString, getIp, handleOptions, hashIp, json, ok, parseBody, requireJson, sendError, setCors } from './_lib/http';
import { rateLimit } from './_lib/rateLimit';
import { sendContactEmail } from './_lib/mailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (handleOptions(req, res)) return;
    setCors(req, res);
    if (req.method !== 'POST') return json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
    requireJson(req);
    const ip = getIp(req);
    rateLimit(`contact:${ip}`, 3, 60 * 60 * 1000);
    const body = contactSchema.parse(await parseBody(req));
    if (body._website || body.honeypot) return ok(res, { success: true });

    const message = {
      name: cleanString(body.name),
      email: cleanString(body.email),
      subject: cleanString(body.subject),
      message: body.message.trim(),
    };

    const db = await getDb();
    let status: 'received' | 'emailed' | 'failed' = 'received';
    try {
      await sendContactEmail(message);
      status = 'emailed';
    } catch (error) {
      status = 'failed';
      console.error('contact email failed', error);
    }

    await db.collection('contactMessages').insertOne({
      ...message,
      ipHash: hashIp(ip),
      userAgent: req.headers['user-agent'],
      status,
      createdAt: new Date(),
    });

    if (status === 'failed') return json(res, 502, { success: false, code: 'SEND_FAILED' });
    ok(res, { success: true });
  } catch (error) {
    sendError(res, error);
  }
}
