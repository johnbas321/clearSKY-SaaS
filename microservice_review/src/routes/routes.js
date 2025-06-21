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
.route("/new/review")
.post(controllers.createReview)
.all(methodNotAllowed);

router
.route("/status/:request_id")
.get(controllers.viewStatus)
.all(methodNotAllowed);

router
.route("/pending-requests")
.get(controllers.viewInstructorRequests)
.all(methodNotAllowed);

router
.route("/request/:request_id/message")
.get(controllers.getRequestMessage)
.all(methodNotAllowed);

router
.route("/new/reply")
.post(controllers.createReply)
.all(methodNotAllowed);

router
.route("/actions/:request_id")
.get(controllers.getReviewActions)
.all(methodNotAllowed);

router
.route("/")
.get(controllers.healthCheck)
.all(methodNotAllowed);

export default router;