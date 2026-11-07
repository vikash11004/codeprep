import 'dotenv/config';
import { app } from './app.js';
import { closeBrowser } from './lib/scraper.js';
import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const dist = fileURLToPath(new URL('../client/dist/', import.meta.url));
if (existsSync(dist)) { app.use(express.static(dist)); app.get('/{*path}', (_req, res) => res.sendFile(`${dist}/index.html`)); }
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
