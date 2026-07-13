import 'dotenv/config';
import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import { createServer as createViteServer } from 'vite';
import apiHandler from '../api/[...path]';

const host = '127.0.0.1';
const port = Number(process.env.PORT ?? 5173);

const vite = await createViteServer({
  server: { middlewareMode: true, host, hmr: { host } },
  appType: 'spa',
});

type DevRequest = IncomingMessage & { query: Record<string, string | string[]>; body?: unknown };
type DevResponse = ServerResponse & {
  status: (code: number) => DevResponse;
  json: (payload: unknown) => void;
  send: (payload: unknown) => void;
};

function decorateResponse(res: ServerResponse): DevResponse {
  const decorated = res as DevResponse;
  decorated.status = (code: number) => {
    decorated.statusCode = code;
    return decorated;
  };
  decorated.json = (payload: unknown) => {
    if (!decorated.headersSent) decorated.setHeader('Content-Type', 'application/json; charset=utf-8');
    decorated.end(JSON.stringify(payload));
  };
  decorated.send = (payload: unknown) => {
    if (Buffer.isBuffer(payload) || typeof payload === 'string') decorated.end(payload);
    else decorated.json(payload);
  };
  return decorated;
}

async function handleApi(req: IncomingMessage, res: ServerResponse, url: URL): Promise<void> {
  const apiPath = url.pathname.replace(/^\/api\/?/, '');
  const query: Record<string, string | string[]> = { path: apiPath };
  for (const [key, value] of url.searchParams) {
    const current = query[key];
    if (Array.isArray(current)) current.push(value);
    else if (current) query[key] = [current, value];
    else query[key] = value;
  }
  const devReq = req as DevRequest;
  devReq.query = query;
  try {
    await apiHandler(devReq as never, decorateResponse(res) as never);
  } catch (error) {
    console.error('local API handler failed', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ success: false, code: 'INTERNAL_ERROR' }));
    }
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? `${host}:${port}`}`);
  if (url.pathname.startsWith('/api/')) {
    void handleApi(req, res, url);
    return;
  }
  vite.middlewares(req, res, () => {
    res.statusCode = 404;
    res.end('Not found');
  });
});

server.listen(port, host, () => {
  console.log(`Salma portfolio dev server ready: http://${host}:${port}`);
  console.log('Vite SPA + local Vercel-compatible API are served by bun dev.');
});

function shutdown() {
  server.close(() => void vite.close().then(() => process.exit(0)));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
