import { grades } from '../utils/mockData.js';
import { db } from '../utils/database.js'
import { UsageError } from '../errors/usageError.js';
import xlsx from 'xlsx';


export async function uploadInitialGrades(req, res, next){
  try{
    const courseId = req.params.id;

    if (req.user.role !== 'instructor') {
      throw new UsageError('Only instructors can upload grades', 403);
    }
    if (!req.file) {
      throw new UsageError('No file uploaded', 400);
    }

    const [courseRows] = await db.query(
      'SELECT * FROM courses WHERE id = ? AND instructor_id = ? AND grade_sate = ?',
      [courseId, req.user.userId, 'VOID']
    );

    if (courseRows.length === 0) {
      throw new UsageError('Course not found or access denied', 404);
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const grades = xlsx.utils.sheet_to_json(sheet, {range: 2});

    if (!grades.length) {
      throw new UsageError('Excel file is empty or improperly formatted', 400);
    }

    const insertValues = grades.map(g => [
      g["Αριθμός Μητρώου"],
      g["Τμήμα Τάξης"].split(' ').pop().replace(/^\(+|\)+$/g, ''),
      g["Βαθμολογία"],
    ]);

    await db.query(
      'INSERT INTO grades (student_id, course_id, grade) VALUES ?',
      [insertValues]
    );

    await db.query(
      'UPDATE courses SET grade_sate = ? WHERE id = ?',
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
        throw new UsageError('Only instructors can upload grades', 403);
      }
      const courseId = req.params.id;
      
      if (!req.file) {
        throw new UsageError('No file uploaded', 400);
      }
  
      const [courseRows] = await db.query(
        'SELECT * FROM courses WHERE id = ? AND instructor_id = ? AND grade_sate = ?',
        [courseId, req.user.userId, 'OPEN']
      );
  
      if (courseRows.length === 0) {
        throw new UsageError('Course not in OPEN state or not accessible', 400);
      }
  
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const grades = xlsx.utils.sheet_to_json(sheet);
  
      if (!grades.length) {
        throw new UsageError('Excel file is empty or improperly formatted', 400);
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
        'UPDATE courses SET grade_sate = ? WHERE id = ?',
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
        throw new UsageError('Only students can view their grades', 403);
      }
  
      const studentId = req.user.userId;
  
      const [rows] = await db.query(
        `
        SELECT g.course_id, c.course_name AS courseTitle, g.grade AS grade, c.grade_sate AS state
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
        throw new UsageError('Only students can enroll in a course', 403);
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
        throw new UsageError('Only students can drop a course', 403);
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
        throw new UsageError('Only instructor can create a course', 403);
      }
      const courseName = req.body.coursename;
      const startDate = req.body.startdate;
      const endDate = req.body.enddate;
      const instructor_id = req.user.userId;

      await db.query(
        'INSERT INTO courses (course_name, startDate, endDate, instructor_id, grade_sate) VALUES (?, ?, ?, ?, ?)',
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
        throw new UsageError('Only instructors can delete a course.', 403);
      }

      const courseId = req.params.id;
      const instructor_id = req.user.userId;
      console.log(courseId)
      console.log(instructor_id)

      const [courseRows] = await db.query(
        'SELECT * FROM courses WHERE id = ? AND instructor_id = ? AND grade_sate = ?',
        [courseId, instructor_id, 'VOID']
      );
  
      if (courseRows.length === 0) {
        throw new UsageError('Only courses with a VOID state can be deleted by the same instructor', 404);
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
      console.log(req.params);
      console.log("---------");
      console.log(req);
      console.log("---------");
      console.log(res);
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