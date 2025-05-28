import client from './redisClient.js';

export async function validateToken(req, res, next) {
  try {
    const sessionId = req.cookies.sessionId;

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
