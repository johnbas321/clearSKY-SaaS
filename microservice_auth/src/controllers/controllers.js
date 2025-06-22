import crypto from 'crypto';
import util from 'util';
import { redisClient } from '../utils/redisClient.js';
import { UsageError } from '../errors/usageError.js'

const scrypt = util.promisify(crypto.scrypt);

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Fetch user from User Management
    const response = await fetch(`http:/userman:3005/users/email/${encodeURIComponent(email)}`);
    console.log(response)
    if (!response.ok) {
      throw new UsageError('No user exists with this email', 404);
    }

    const responseJSON = await response.json();

    if (!responseJSON.success) {
      throw new UsageError('No user exists with this email', 404);
    }

    // Verify password
    const derivedKey = await scrypt(password, responseJSON.data.password_salt, 64);
    const hashedInputPassword = derivedKey.toString('hex');

    if (hashedInputPassword !== responseJSON.data.password_hash) {
      throw new UsageError('Password incorrect', 401);
    }

    // Create session
    const sessionId = `sess:${crypto.randomUUID()}`;

    await redisClient.set(sessionId, JSON.stringify({
      userId: responseJSON.data.id,
      role: responseJSON.data.role,
      userName: responseJSON.data.full_name,
      email: responseJSON.data.email
    }), {
      EX: 86400 // 1 day
    });

    // Set cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      sameSite: 'lax'
    });

    res.json(
      {
        message: 'Logged in successfully',
        user: {
          id: responseJSON.data.id,
          role: responseJSON.data.role,
          fullName: responseJSON.data.full_name,
          email: responseJSON.data.email
        }
      }
    );
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      throw new UsageError('No session ID provided', 400);
    }

    await redisClient.del(sessionId);

    res.clearCookie('sessionId');

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}
