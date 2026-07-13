import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { env } from './env.js';

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function setSecurityHeaders(res: VercelResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');
}

export function setCors(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin;
  if (!origin) return;
  const allowed = env.allowedOrigin;
  const localhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (!allowed || origin === allowed || localhost) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  }
}

export function json(res: VercelResponse, status: number, data: unknown): void {
  setSecurityHeaders(res);
  res.status(status).json(data);
}

export function ok(res: VercelResponse, data: unknown): void {
  json(res, 200, data);
}

export function created(res: VercelResponse, data: unknown): void {
  json(res, 201, data);
}

export function noContent(res: VercelResponse): void {
  setSecurityHeaders(res);
  res.status(204).end();
}

export function methodNotAllowed(res: VercelResponse, methods: string[]): void {
  res.setHeader('Allow', methods.join(', '));
  json(res, 405, { success: false, code: 'METHOD_NOT_ALLOWED' });
}

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export async function parseBody<T = unknown>(req: VercelRequest): Promise<T> {
  if (req.body && typeof req.body === 'object') return req.body as T;
  if (typeof req.body === 'string') return JSON.parse(req.body) as T;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export function requireJson(req: VercelRequest): void {
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method ?? '')) {
    const type = req.headers['content-type'] ?? '';
    if (!String(type).includes('application/json') && !String(type).includes('multipart/form-data')) {
      throw new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Use application/json.');
    }
  }
}

export function sendError(res: VercelResponse, error: unknown): void {
  if (error instanceof HttpError) {
    json(res, error.status, { success: false, code: error.code, message: error.message, details: error.details });
    return;
  }
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    json(res, 422, { success: false, code: 'VALIDATION', details: error });
    return;
  }
  console.error(error);
  json(res, 500, { success: false, code: 'INTERNAL_ERROR' });
}

export function getIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  if (Array.isArray(forwarded) && forwarded[0]) return forwarded[0];
  return req.socket.remoteAddress ?? 'unknown';
}

export function hashIp(ip: string): string {
  const salt = env.authSecret ?? 'salma-portfolio-local';
  return crypto.createHmac('sha256', salt).update(ip).digest('hex');
}

export function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function cleanString(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
}
