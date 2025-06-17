import { UsageError } from '../errors/usageError.js';
import  pool  from '../utils/database.js';
import { gradeCache } from '../utils/nodeCache.js';
import { Grade } from '../models/Grade.js';
import { Course } from '../models/Course.js';
import xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

export async function createCourse(req, res, next){
  try{
    if (req.user.role !== 'instructor'){
      throw new UsageError('Only instructor can create a course', 403);
    }
    const course_id = parseInt(req.body.course_id)
    const course_name = req.body.course_name;
    const instructor_id = req.user.userId;
    const time_period = req.body.time_period;

    await Course.create({ course_id, course_name, instructor_id, start_date, end_date });
    // await pool.query(
    //   'INSERT INTO courses (course_name, startDate, endDate, instructor_id, grade_sate) VALUES (?, ?, ?, ?, ?)',
    //   [courseName, startDate, endDate, instructor_id, "VOID"]
    // );

    res.status(201).json({ message: 'Course created successfully', course_name });

  }catch(err){
    next(err);
  }
}

export async function deleteCourse(req, res, next){
  try{
    if (req.user.role !== 'instructor'){
      throw new UsageError('Only instructors can delete a course.', 403);
    }

    const course_name = req.body.id;

    if(!await Course.delete(course_name)){
      throw new UsageError('Only courses with a VOID state can be deleted by the same instructor', 404);
    }

    res.status(201).json({ message: 'Course removed successfully', course_name });

  }catch(err){
    next(err);
  }
}


export async function uploadInitialGrades(req, res, next){
  try{
    const user_id = req.user.userId;
    //const { course_name, period, number_of_grades } = req.body;

    if (req.user.role !== 'instructor') {
      throw new UsageError('Only instructors can upload grades', 403);
    }
    if (!req.file) {
      throw new UsageError('No file uploaded', 400);
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const grades = xlsx.utils.sheet_to_json(sheet, {range: 2});
    const fullCourse = sheet['A1']?.v;

    const withoutPrefix = fullCourse.replace(/^ΒΑΘΜΟΛΟΓΙΟ\s*/, '');
    const course_name = withoutPrefix.match(/^(.*?)\s*\(/)?.[1].trim();
    const course_id = parseInt(withoutPrefix.match(/\((\d+)\)/)?.[1]);
    const time_period = normalizePeriod(withoutPrefix.match(/\)\s*(.+)$/)?.[1].trim());

    if (!grades.length) {
      throw new UsageError('Excel file is empty or improperly formatted', 400);
    }

    const cache_id = uuidv4();
    gradeCache.set(cache_id, { course_id, course_name, time_period, grades });

    // await pool.query(
    //   'UPDATE courses SET grade_sate = ? WHERE id = ?',
    //   ['OPEN', courseId]
    // );  

    res.status(200).json({
      message: 'Excel parsed successfully', 
      data: {
        cache_id,
        course_name,
        time_period,
        count: grades.length
      }});
  }catch(err){
    next(err)
  }
}

export async function confirmInitalUpload(req, res, next) {
  try {
    if (req.user.role !== 'instructor') {
      throw new UsageError('Only instructors can upload grades', 403);
    }

    const { cache_id } = req.body;
    const user_id = req.user.userId;

    const data = gradeCache.get(cache_id);
    if (!data){
      throw new UsageError('Upload session expired', 410);
    }
    const { course_id, course_name, time_period, grades } = data;

    await Course.create({ id: course_id, course_name, instructor_id: user_id, time_period });

    await Promise.all(grades.map(async g => {
      const gradeFullCourse = g["Τμήμα Τάξης"].trim().split(' ');
      const grade_course_id = parseInt(gradeFullCourse.pop().replace(/^\(+|\)+$/g, ''));
      const grade_course_name = gradeFullCourse.join(' ').trim();
      if (grade_course_id !== course_id || grade_course_name !== course_name || g["Περίοδος δήλωσης"] !== time_period ){
        throw new UsageError('Invalid or incomplete Excel data.', 400);
      }
      const student_id = parseInt(g["Αριθμός Μητρώου"]);
      const grade = parseInt(g["Βαθμολογία"]);
      const grades_per_question = Object.keys(g).filter(k => /^Q\d+$/.test(k)).map(k => g[k]).join(',');

      try {
      await Grade.create({ course_id, time_period, student_id, grade, grades_per_question, is_final: false })
      }catch (err){
        console.error("Unable to create grade entity", err);
        throw err;
      }
    }));

    gradeCache.del(cache_id);

    res.status(201).json({
      message: "Grades uploaded successfully"
    });
  } catch (err){
    next(err);
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

    const [courseRows] = await pool.query(
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

    await pool.query(
      'DELETE FROM grades WHERE course_id = ?',
      [courseId]
    );

    // Insert final grades
    const insertValues = grades.map(g => [
      g.studentId,
      courseId,
      g.grade,
    ]);

    await pool.query(
      'INSERT INTO grades (student_id, course_id, grade) VALUES ?',
      [insertValues]
    );

    await pool.query(
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

    const [rows] = await pool.query(
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

function normalizePeriod(periodStr) {
  const [yearRange, season] = periodStr.split(' '); // e.g., ["2024-2025", "Χειμερινή"]

  const seasonMap = {
    'Χειμερινή': 'ΧΕΙΜ',
    'Εαρινή': 'ΕΑΡ'
  };

  const normalizedSeason = seasonMap[season] || season.toUpperCase();
  const startYear = yearRange.split('-')[0];

  return `${yearRange} ${normalizedSeason} ${startYear}`;
}