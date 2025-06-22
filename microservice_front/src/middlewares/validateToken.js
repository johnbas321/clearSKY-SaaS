import { client } from '../utils/redisClient.js';

export async function validateToken(req, res, next) {
  try {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
      return res.redirect('/login');
    }

    const session = await client.get(sessionId);
    if (!session) {
      res.clearCookie('sessionId');
      return res.redirect('/login');
    }

    const userData = JSON.parse(session);
    req.user = userData;
    next();
  } catch (err) {
    console.error('Session validation error:', err);
    res.clearCookie('sessionId');
    return res.redirect('/login');
  }
}