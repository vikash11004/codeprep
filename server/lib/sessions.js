import { readStore, saveStore } from './store.js';

export async function getSession(id) {
  const sessions = await readStore('sessions');
  if (!Object.hasOwn(sessions, id)) Object.defineProperty(sessions, id, { value: { id, attempts: 0, passed: 0, failed: 0, failureCategories: { misread_problem: 0, wrong_approach: 0, implementation_bug: 0 }, problemHistory: [], activity: [], lastRun: null }, enumerable: true, writable: true, configurable: true });
  const session = sessions[id];
  if (!session.save) Object.defineProperty(session, 'save', { value: () => saveStore('sessions'), enumerable: false });
  return session;
}
export async function sessionMiddleware(req, res, next) {
  try {
    const id = req.headers['x-session-id'];
    if (!id || !/^[A-Za-z0-9_-]{8,100}$/.test(id)) return res.status(400).json({ error: 'A valid session ID is required. Refresh the app.' });
    req.session = await getSession(id); req.sessionId = id; next();
  } catch (error) { next(error); }
}
