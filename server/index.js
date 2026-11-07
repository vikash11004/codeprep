import 'dotenv/config';
import { app } from './app.js';
import { closeBrowser } from './lib/scraper.js';
import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const candidateDists = [
  fileURLToPath(new URL('../client/dist', import.meta.url)),
  fileURLToPath(new URL('./client/dist', import.meta.url)),
  join(process.cwd(), '../client/dist'),
  join(process.cwd(), 'client/dist'),
  join(process.cwd(), 'dist')
];
const dist = candidateDists.find(d => existsSync(join(d, 'index.html')));

if (dist) {
  const indexHtml = join(dist, 'index.html');
  console.log(`[CodePrep] Serving client UI from ${dist}`);
  app.use(express.static(dist));
  app.get('/{*path}', (_req, res) => res.sendFile(indexHtml));
} else {
  console.warn(`[CodePrep] Warning: Client dist not found in candidate paths:`, candidateDists);
}
const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT) || 3001;
// Bind to 0.0.0.0 by default for cloud hosting (Render, Docker, etc.) while allowing HOST override
const server = app.listen(port, host, () => {
  const displayHost = host === '0.0.0.0' ? '127.0.0.1' : host;
  console.log(`[CodePrep] http://${displayHost}:${port} · local persistent storage · native execution`);
});
async function shutdown() { await closeBrowser().catch(() => {}); server.close(() => process.exit(0)); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
