import express from 'express';
import multer from 'multer';

import * as controllers from '../controllers/controller.js';
import { validateToken } from '../middlewares/validateToken.js';
import { UsageError } from '../errors/usageError.js';

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const router = express.Router();

const methodNotAllowed = (req, res, next) => next(new UsageError(`Method ${req.method} not supported on ${req.originalUrl}`, 405));


router.use(validateToken)

router
.route("/upload/inital")
.post(upload.single('file'), controllers.uploadInitialGrades)
.all(methodNotAllowed);

router
.route("/upload/inital/confirm")
.post(controllers.confirmInitalUpload)
.all(methodNotAllowed);

router
.route("/upload/final")
.post(upload.single('file'), controllers.uploadFinalGrades)
.all(methodNotAllowed);

router
.route("/healthcheck")
.get(controllers.healthCheck)
.all(methodNotAllowed);

router
.route("/courses")
.post(controllers.deleteCourse)
.all(methodNotAllowed);

router
.route("/courses")
.post(controllers.createCourse)
.all(methodNotAllowed);

router
.route("/user/self/grades")
.get(controllers.viewStudentGrades)
.all(methodNotAllowed);

router
.route("/")
.get(controllers.testAPI)
.all(methodNotAllowed);

export default router;