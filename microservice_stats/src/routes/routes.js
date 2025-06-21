import express from 'express';
import multer from 'multer';

import * as controllers from '../controllers/controller.js';
import { validateToken } from '../middlewares/validateToken.js';
import { internalAuth } from '../middlewares/internalAuth.js';
import { UsageError } from '../errors/usageError.js';

const router = express.Router();

const methodNotAllowed = (req, res, next) => next(new UsageError(`Method ${req.method} not supported on ${req.originalUrl}`, 405));

//  Orchestrator API Endpoints
 
router.use(validateToken)

router
.route("/")
.get(controllers.getStats)
.all(methodNotAllowed);

export default router;