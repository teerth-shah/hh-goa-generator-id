import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, isAbsolute, normalize, relative, resolve } from 'node:path';

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
const dist = resolve(process.cwd(), 'dist');
createServer((request, response) => {
  const pathname = request.url === '/' ? 'index.html' : request.url.split('?')[0].replace(/^\/+/, '');
  const file = resolve(dist, normalize(pathname));
  const relativeFile = relative(dist, file);
  if (relativeFile.startsWith('..') || isAbsolute(relativeFile)) return response.writeHead(403).end('Forbidden');
  if (!existsSync(file)) return response.writeHead(404).end('Not found');
  response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(process.env.PORT || 3000, () => console.log(`HH Goa Builder ID: http://localhost:${process.env.PORT || 3000}`));
