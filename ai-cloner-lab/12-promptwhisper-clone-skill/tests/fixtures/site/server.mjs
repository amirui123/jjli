import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const ports = (process.argv.slice(2).length ? process.argv.slice(2) : ['4175']).map(Number);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
const handler = async (request, response) => {
  const port = request.socket.localPort;
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  if (url.pathname === '/api/ping') {
    response.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
    response.end('{"ok":true}');
    return;
  }
  const requested = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const file = path.resolve(root, requested);
  if (!file.startsWith(`${root}${path.sep}`) && file !== path.join(root, 'index.html')) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const body = await readFile(file);
    response.writeHead(200, { 'content-type': mime[path.extname(file)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('Not found');
  }
};
const servers = ports.map((port) => createServer(handler).listen(port, '127.0.0.1', () => console.log(`fixture:${port}`)));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  let remaining = servers.length;
  for (const server of servers) server.close(() => { if (--remaining === 0) process.exit(0); });
});
