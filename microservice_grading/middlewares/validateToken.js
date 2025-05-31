import { client } from '../utils/redisClient.js';

export async function validateToken(req, res, next) {
  try {
    console.log(req.cookies)
    const sessionId = req.cookies.sessionId;
    console.log(sessionId);
    console.log('fasdfasfasdfasfasdf')
    if (!sessionId) {
      return res.status(401).json({ error: "Missing session token" });
    }

    const session = await client.get(`session:${sessionId}`);

    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const userData = JSON.parse(session);
    req.user = userData;
    next();
  } catch (err) {
        next(err)
  }
}
