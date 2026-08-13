import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
createServer((request, response) => {
  const path = request.url === '/' ? 'index.html' : request.url.slice(1).split('?')[0];
  const file = join(process.cwd(), path);
  if (!existsSync(file)) return response.writeHead(404).end('Not found');
  response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(3000, () => console.log('HH Goa Builder ID: http://localhost:3000'));
