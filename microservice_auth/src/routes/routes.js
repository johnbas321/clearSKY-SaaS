import express from 'express';
import { login, logout } from '../controllers/controllers.js';

import { UsageError } from '../errors/usageError.js';

const methodNotAllowed = (req, res, next) => next(new UsageError(`Method ${req.method} not supported on ${req.originalUrl}`, 405));

const router = express.Router();

router
.route('/login')
.post(login)
.all(methodNotAllowed);

router
.route('/logout')
.post(logout)
.all(methodNotAllowed);

export default router;