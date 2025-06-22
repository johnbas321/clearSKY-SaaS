import express from 'express';
import multer from 'multer';

import * as controllers from '../controllers/controller.js';
import { validateToken } from '../middlewares/validateToken.js';
import { internalAuth } from '../middlewares/internalAuth.js';
import { UsageError } from '../errors/usageError.js';

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const router = express.Router();

const methodNotAllowed = (req, res, next) => next(new UsageError(`Method ${req.method} not supported on ${req.originalUrl}`, 405));

// Internal API Endpoints

router
.route("/internal/grades/stats")
.get(internalAuth, controllers.getGradesForStats)
.all(methodNotAllowed);

//  Orchestrator API Endpoints

router.use(validateToken)

router
.route("/upload")
.post(upload.single('file'), controllers.uploadGrades)
.all(methodNotAllowed);

router
.route("/upload/initial/confirm")
.post(controllers.confirmInitalUpload)
.all(methodNotAllowed);

router
.route("/upload/final/confirm")
.post(controllers.confirmFinalUpload)
.all(methodNotAllowed);

router
.route("/healthcheck")
.get(controllers.healthCheck)
.all(methodNotAllowed);

router
.route("/courses/delete")
.post(controllers.deleteCourse)
.all(methodNotAllowed);

router
.route("/courses/create")
.post(controllers.createCourse)
.all(methodNotAllowed);

router
.route("/courses")
.get(controllers.viewAllCourses)
.all(methodNotAllowed);

router
.route("/self/courses")
.get(controllers.viewStudentCourses)
.all(methodNotAllowed);

router
.route("/self/grades")
.get(controllers.viewStudentGrades)
.all(methodNotAllowed);

export default router;