import { grades } from '../utils/mockData.js';

export const getAllGrades = (req, res) => {
  res.json(grades);
};

export const addGrade = (req, res) => {
  const { studentId, courseId, initialGrade } = req.body;
  const newGrade = {
    id: grades.length + 1,
    studentId,
    courseId,
    initialGrade,
    finalGrade: null,
    status: 'OPEN'
  };
  grades.push(newGrade);
  res.status(201).json(newGrade);
};

export const updateFinalGrade = (req, res) => {
  const { id } = req.params;
  const { finalGrade } = req.body;
  const grade = grades.find(g => g.id === parseInt(id));
  if (!grade) return res.status(404).json({ error: 'Grade not found' });

  grade.finalGrade = finalGrade;
  grade.status = 'FINAL';
  res.json(grade);
};