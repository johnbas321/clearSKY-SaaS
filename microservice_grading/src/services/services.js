import { executeQuery } from '../utils/database.js';

export async function joinGradeWithCourse(student_id) {
    const query = `
        SELECT
            c.id,
            c.course_name,
            g.time_period,
            c.grade_state,
            c.instructor_id
        FROM grades g
        JOIN courses c on c.id = g.course_id AND c.time_period = g.time_period
        WHERE student_id = ?
    `
    try {
        const result = await executeQuery(query,[student_id]);
        return result;
    } catch (err){
        throw err;
    }
}

export async function getGradesPerCourse(student_id, course_id, time_period) {
    const query = `
        SELECT
            grade,
            grades_per_question
        FROM grades WHERE student_id = ? AND course_id = ? AND time_period = ?
    `
    try {
        const result = await executeQuery(query,[student_id, course_id, time_period]);
        if (result.length > 0){
            return { grade: result[0].grade, grades_per_question : result[0].grades_per_question };
        }
        return result;
    } catch (err){
        throw err;
    }
}

export async function getGradesForStatistics(course_id, time_period, is_final) {
    const query = `
        SELECT
            grade,
            grades_per_question
        FROM grades WHERE course_id = ? AND time_period = ? AND is_final = ?
    `
    try {
        const result = await executeQuery(query,[course_id, time_period, is_final]);
        console.log(result)
        if (result.length > 0){
            const transformed = result.map(row => {
                const gradesArray = row.grades_per_question.split(',').map(Number);
                const gradesByQuestion = {};
                gradesArray.forEach((grade, index) => {
                gradesByQuestion[`Q${index + 1}`] = grade;
                });
                return {
                    grade: row.grade,
                    grades_per_question: gradesByQuestion
                };
            });
            return transformed;
         }
        return result;
    } catch (err){
        throw err;
    }
}