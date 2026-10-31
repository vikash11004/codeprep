import 'dotenv/config';
import { app } from './app.js';
import { closeBrowser } from './lib/scraper.js';
import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const dist = fileURLToPath(new URL('../client/dist/', import.meta.url));
if (existsSync(dist)) { app.use(express.static(dist)); app.get('/{*path}', (_req, res) => res.sendFile(`${dist}/index.html`)); }
const port = Number(process.env.PORT) || 3001;
// Local execution is for the owner of this computer, never an internet-facing judge.
const server = app.listen(port, '127.0.0.1', () => console.log(`[CodePrep] http://127.0.0.1:${port} · local persistent storage · native execution`));
async function shutdown() { await closeBrowser().catch(() => {}); server.close(() => process.exit(0)); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
