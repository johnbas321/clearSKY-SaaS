import express from 'express';
import {
  getAllGrades,
  addGrade,
  updateFinalGrade
} from '../controllers/controller.js';

const router = express.Router();

router.get('/', getAllGrades);
router.post('/', addGrade);
router.patch('/:id', updateFinalGrade);

export default router;