import { UsageError } from '../errors/usageError.js';
import  pool  from '../utils/database.js';
import { gradeCache } from '../utils/nodeCache.js';
import { Grade } from '../models/Grade.js';
import { Course } from '../models/Course.js';
import { joinGradeWithCourse } from '../services/services.js';
import { getGradesPerCourse } from '../services/services.js';
import { getGradesForStatistics } from '../services/services.js';
import xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

export async function createCourse(req, res, next){
  try{
    if (req.user.role !== 'instructor'){
      throw new UsageError('Only instructor can create a course', 403);
    }
    if (!req.body){
      throw new UsageError('Request is missing important information', 400)
    }

    const course_id = parseInt(req.body.course_id)
    const course_name = req.body.course_name;
    const instructor_id = req.user.userId;
    const time_period = req.body.time_period;

    await Course.create({ course_id, course_name, instructor_id, start_date, end_date });

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
    if (!req.body){
      throw new UsageError('Request is missing important information', 400)
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


export async function uploadGrades(req, res, next){
  try{
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
    if (!req.body){
      throw new UsageError('Request is missing important information', 400)
    }

    const { cache_id } = req.body;
    const user_id = req.user.userId;

    const data = gradeCache.get(cache_id);
    if (!data){
      throw new UsageError('Upload session expired', 410);
    }
    const { course_id, course_name, time_period, grades } = data;

    if (!await Course.canUploadInitialGrades(course_name, time_period)){
      throw new UsageError('Can not upload initial grades. Grades are finalized for this course;', 404);
    }

    await Course.create({ id: course_id, course_name, instructor_id: user_id, time_period, grade_state: "OPEN"});

    await Promise.all(grades.map(async g => {
      const gradeFullCourse = g["Τμήμα Τάξης"].trim().split(' ');
      const grade_course_id = parseInt(gradeFullCourse.pop().replace(/^\(+|\)+$/g, ''));
      const grade_course_name = gradeFullCourse.join(' ').trim();
      if (grade_course_id !== course_id || grade_course_name !== course_name || g["Περίοδος δήλωσης"] !== time_period ){
        throw new UsageError('Invalid or incomplete Excel data.', 400);
      }
      const student_id = parseInt(g["Αριθμός Μητρώου"]);
      const grade = parseInt(g["Βαθμολογία"]);
      const grades_per_question = Object.fromEntries( Object.entries(g).filter(([k]) => /^Q\d+$/.test(k)) );
      const total_questions = Object.keys(grades_per_question).length;

      try {
      await Grade.create({ course_id, time_period, student_id, grade, total_questions, grades_per_question, is_final: false })
      }catch (err){
        console.error("Unable to create grade entity", err);
        throw err;
      }
    }));

    gradeCache.del(cache_id);

    res.status(201).json({
      message: "Inital grades uploaded successfully"
    });
  } catch (err){
    next(err);
  }
}

export async function confirmFinalUpload(req, res, next) {
  try {
    if (req.user.role !== 'instructor') {
      throw new UsageError('Only instructors can upload grades', 403);
    }
    if (!req.body){
      throw new UsageError('Request is missing important information', 400)
    }    

    const { cache_id } = req.body;
    const user_id = req.user.userId;

    const data = gradeCache.get(cache_id);
    if (!data){
      throw new UsageError('Upload session expired', 410);
    }
    const { course_id, course_name, time_period, grades } = data;

    if (!await Course.canUploadFinalGrades(course_name, time_period)){
      throw new UsageError('You need to upload inital grades first;', 404);
    }

    await Promise.all(grades.map(async g => {
      const gradeFullCourse = g["Τμήμα Τάξης"].trim().split(' ');
      const grade_course_id = parseInt(gradeFullCourse.pop().replace(/^\(+|\)+$/g, ''));
      const grade_course_name = gradeFullCourse.join(' ').trim();
      if (grade_course_id !== course_id || grade_course_name !== course_name || g["Περίοδος δήλωσης"] !== time_period ){
        throw new UsageError('Invalid or incomplete Excel data.', 400);
      }
      const student_id = parseInt(g["Αριθμός Μητρώου"]);
      const grade = parseInt(g["Βαθμολογία"]);
      const grades_per_question = Object.fromEntries( Object.entries(g).filter(([k]) => /^Q\d+$/.test(k)) );
      const total_questions = Object.keys(grades_per_question).length;

      try {
      await Grade.create({ course_id, time_period, student_id, grade, total_questions, grades_per_question, is_final: true })
      }catch (err){
        console.error("Unable to create grade entity", err);
        throw new UsageError("Error trying to store grades", 410);

      }
    }));

    gradeCache.del(cache_id);

    await Course.create({ id: course_id, course_name, instructor_id: user_id, time_period, grade_state: "FINAL" });

    res.status(201).json({
      message: "Final grades uploaded successfully"
    });
  } catch (err){
    next(err);
  }
}

export async function viewAllCourses(req, res, next) {
  try {
    const result = await Course.getAllCourses();
    res.status(200).json(result)
  } catch (err) {
    next (err);
  }
}

export async function viewStudentCourses(req, res, next){
  try {
    const student_id = req.user.userId;

    if (req.user.role !== 'student') {
      throw new UsageError('Only students can view their courses', 403);
    }

    const result = await joinGradeWithCourse(student_id);
    res.status(201).json(result);

  } catch (err){
    next(err);
  }
}

export async function viewStudentGrades(req, res, next) {
  try{
      const student_id = req.user.userId;
      const { course_id, time_period } = req.query;

      if (req.user.role !== 'student') {
        throw new UsageError('Only students can view their courses', 403);
      }
      if (!course_id || !time_period){
        throw new UsageError('Request is missing important information', 400)
      }

      const result = await getGradesPerCourse(student_id, course_id, time_period);
      if (result.length == 0){
        throw new UsageError("No grades found for this course at the specific time period", 404);
      }
      res.status(201).json(result);

  } catch (err){
    next(err);
  }
}

// Internal API Controllers

export async function getGradesForStats(req, res, next) {
  try {
    const { course_id, time_period, is_final } = req.query;
    if (!course_id || !time_period){
      throw new UsageError("Missing query params", 404);
    }
    if (!course_id || !time_period || !is_final){
      throw new UsageError("Missing query params", 404);
    }
    const result = await Grade.aggregateGrades(course_id, time_period, is_final);
    if (result.length === 0 ){
      throw new UsageError("No grades found", 404);
    }
    res.status(200).json(result);

  } catch (err) {
    next (err);
  }
}

export async function healthCheck(req, res, next){
  try{
    res.json({message: 'healthy'});
  } catch (err){
    next(err);
  }
}

function normalizePeriod(periodStr) {
  const [yearRange, season] = periodStr.split(' ');

  const seasonMap = {
    'Χειμερινή': 'ΧΕΙΜ',
    'Εαρινή': 'ΕΑΡ'
  };

  const normalizedSeason = seasonMap[season] || season.toUpperCase();
  const startYear = yearRange.split('-')[0];

  return `${yearRange} ${normalizedSeason} ${startYear}`;
}