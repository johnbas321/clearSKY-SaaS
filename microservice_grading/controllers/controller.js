import { grades } from '../utils/mockData.js';
import { db } from '../utils/database.js'
import xlsx from 'xlsx';


export async function uploadInitialGrades(req, res, next){
  try{
    if (req.user.role !== 'instructor') {
      return res.status(403).json({error: 'Only instructors can upload grades'});
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const [courseRows] = await db.query(
      'SELECT * FROM courses WHERE id = ? AND instructor_id = ? AND grade_state = ?',
      [courseId, req.user.userId, 'VOID']
    );

    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Course not found or access denied' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const grades = xlsx.utils.sheet_to_json(sheet);

    if (!grades.length) {
      return res.status(400).json({ error: 'Excel file is empty or improperly formatted' });
    }

    const insertValues = grades.map(g => [
      g.id,
      g.studentId,
      courseId,
      g.grade,
    ]);

    await db.query(
      'INSERT INTO grades (student_id, course_id, grade) VALUES ?',
      [insertValues]
    );

    await db.query(
      'UPDATE courses SET grade_state = ? WHERE id = ?',
      ['OPEN', courseId]
    );  

    res.status(201).json({ message: 'Initial grades uploaded', count: insertValues.length });
    } catch(err){
      next(err)
    }
  }

  export async function uploadFinalGrades(req, res, next) {
    try {
      if (req.user.role !== 'instructor') {
        return res.status(403).json({ error: 'Only instructors can upload final grades' });
      }
  
      const courseId = req.params.id;
  
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      const [courseRows] = await db.query(
        'SELECT * FROM courses WHERE id = ? AND instructor_id = ? AND grade_state = ?',
        [courseId, req.user.userId, 'OPEN']
      );
  
      if (courseRows.length === 0) {
        return res.status(400).json({ error: 'Course not in OPEN state or not accessible' });
      }
  
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const grades = xlsx.utils.sheet_to_json(sheet);
  
      if (!grades.length) {
        return res.status(400).json({ error: 'Excel file is empty or invalid format' });
      }
  
      await db.query(
        'DELETE FROM grades WHERE course_id = ?',
        [courseId]
      );
  
      // Insert final grades
      const insertValues = grades.map(g => [
        g.studentId,
        courseId,
        g.grade,
      ]);
  
      await db.query(
        'INSERT INTO grades (student_id, course_id, grade) VALUES ?',
        [insertValues]
      );
  
      await db.query(
        'UPDATE courses SET grade_state = ? WHERE id = ?',
        ['FINAL', courseId]
      );
  
      res.status(201).json({ message: 'Final grades uploaded', count: insertValues.length });
  
    } catch (err) {
      next(err);
    }
  }
  
  export async function viewStudentGrades(req, res, next) {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Only students can view their grades' });
      }
  
      const studentId = req.user.userId;
  
      const [rows] = await db.query(
        `
        SELECT g.course_id, c.title c.grade_state AS courseTitle, g.grade
        FROM grades g
        JOIN courses c ON g.course_id = c.id
        WHERE g.student_id = ?
        `,
        [studentId]
      );
  
      res.json(rows);
  
    } catch (err) {
      next(err);
    }
  }

  export async function enrollInCourse(req, res, next) {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Only students can enroll in courses' });
      }
  
      const courseId = req.params.id;
      const studentId = req.user.userId;
  
      await db.query(
        'INSERT INTO enrollments (course_id, student_id, enrolled_at) VALUES (?, ?, ?)',
        [courseId, studentId, new Date()]
      );
  
      res.status(201).json({ message: 'Enrolled successfully', courseId });
  
    } catch (err) {
      next(err);
    }
  }

  export async function dropCourse(req, res, next) {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Only students can drop courses' });
      }
  
      const courseId = req.params.id;
      const studentId = req.user.userId;

      const [result] = await db.query(
        'DELETE FROM enrollments WHERE course_id = ? AND student_id = ?',
        [courseId, studentId]
      );

      res.json({ message: 'Unenrolled successfully', courseId });
  
    } catch (err) {
      next(err);
    }
  }

  export async function createCourse(req, res, next){
    try{
      if (req.user.role !== 'instructor'){
        return res.status(403).json({ error: 'Only instructors can upload final grades' });
      }
      const courseName = req.params.courseName;
      const startDate = req.params.startDate;
      const endDate = req.params.endDate;
      const instructor_id = req.user.userId;

      await db.query(
        'INSERT INTO courses (course_name, startDate, endDate, instructor_id, grade_state) VALUES (? ? ? ?)',
        [courseName, startDate, endDate, instructor_id, "VOID"]
      );

      res.status(201).json({ message: 'Course created successfully', courseName });

    }catch(err){
      next(err);
    }
  }

  export async function deleteCourse(req, res, next){
    try{
      if (req.user.role !== 'instructor'){
        return res.status(403).json({ error: 'Only instructors can delete a course.' });
      }

      const courseId = req.params.courseId;
      const instructor_id = req.user.userId;

      const [courseRows] = await db.query(
        'SELECT * FROM courses WHERE id = ? AND instructor_id = ? AND grade_state = ?',
        [courseId, instructor_id, 'VOID']
      );
  
      if (courseRows.length === 0) {
        return res.status(404).json({ error: 'Only courses with a VOID state can be deleted by the same instructor'});
      }

      await db.query(
        'DELETE FROM courses WHERE id = ?',
        [courseId]
      );

      res.status(201).json({ message: 'Course removed successfully', courseId });


    }catch(err){
      next(err);
    }
  }


  export async function healthCheck(req, res, next){
    try{
      res.json({message: 'healthy'});
    } catch (err){
      next(err);
    }
  }

  export async function testAPI(req, res, next){
    try{
      res.json({message: 'All Good'});
    } catch (err){
      next(err);
    }
  }