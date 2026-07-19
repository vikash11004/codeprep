import { Session } from '../models/Session.js';

export async function sessionMiddleware(req, res, next) {
  try {
    const sessionId = req.headers['x-session-id'] || 'default';
    let session = await Session.findOne({ id: sessionId });
    
    if (!session) {
      session = new Session({ id: sessionId });
      await session.save();
    }
    
    req.session = session;
    req.sessionId = sessionId;
    next();
  } catch (error) {
    console.error('[Session Middleware Error]', error);
    next(error);
  }
}

export async function getSession(id) {
  return await Session.findOne({ id });
}
