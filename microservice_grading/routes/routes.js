import express from 'express';
import multer from 'multer';

import * as controllers from '../controllers/controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const router = express.Router();


//router.use(validateToken)

router
.route("/api/courses/:id/grades/upload/inital")
.post(upload.single('file'), controllers.uploadInitialGrades);

router
.route("/api/courses/:id/grades/upload/final")
.post(upload.single('file'), controllers.uploadInitialGrades);

router
.route("/api/healthcheck")
.get(controllers.healthCheck)

router
.route("/api/courses/:id/enroll")
.post(controllers.enrollInCourse);

router
.route("/api/courses/:id/drop")
.post(controllers.dropCourse);

router
.route("/api/courses/:id")
.post(controllers.deleteCourse);

router
.route("/api/course")
.post(controllers.createCourse);

router
.route("/api/user/self/grades")
.get(controllers.viewStudentGrades);

router
.route("/")
.get(controllers.testAPI);

export default router;