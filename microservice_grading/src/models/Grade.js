import { executeQuery } from '../utils/database.js';

export class Grade {
    constructor(data ={}){
        this.course_id = data.course_id;
        this.time_period = data.time_period;
        this.student_id = data.student_id;
        this.grade = data.grade;
        this.total_questions = data.total_questions;
        this.grades_per_question = data.grades_per_question;
        this.is_final = data.is_final || false;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(gradeData){
        const { course_id, time_period, student_id, grade, total_questions, grades_per_question, is_final } = gradeData;
        const query = `
            INSERT INTO grades (course_id, time_period, student_id, grade, total_questions, grades_per_question, is_final)
            VALUES(?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                grade = VALUES(grade),
                grades_per_question = VALUES(grades_per_question),
                is_final = VALUES(is_final)
        `;
        try {
            await executeQuery(query, [course_id, time_period, student_id, grade, total_questions, grades_per_question, is_final]);
            return new Grade(gradeData);
        } catch(err){
            if (err.code === "ER_DUP_ENTRY"){
                throw new Error('Grade already exists');
            }
            throw err;
        }
    }

    static async findTotalQuestion(course_id, time_period) {
        const query = 'SELECT * FROM grades WHERE course_id = ? and time_period = ? LIMIT 1';
        try {
            const result = await executeQuery(query, [course_id, time_period]);
            if (result.length === 0) {
                return null;
            }
            return result[0].total_questions;
        } catch (err){
            console.error(err);
            throw err;
        }
    }

    static async delete(course_id, time_period, student_id) {
        const query = 'DELETE FROM grades WHERE course_id = ? and time_period = ? and student_id = ?';
        try {
            const result = await executeQuery(query, [course_id, time_period, student_id]);
            if (result.length === 0) {
                return null;
            }
            return result.affectedRows;
        } catch (err){
            console.error(err);
            throw err;
        }
    }

    static async aggregateGrades(course_id, time_period, is_final){
        const total_questions =  parseInt(await Grade.findTotalQuestion(course_id, time_period));
        let query_list = [];
        try{
            query_list.push(executeQuery(`SELECT 'total' as question, grade, COUNT(*) AS count FROM grades WHERE course_id = ? AND time_period = ? AND is_final = ? GROUP BY grade ORDER BY grade`,[course_id, time_period, is_final]));
            for (let index = 1; index < total_questions + 1; index++) {
                query_list.push(executeQuery(createQuestionQuery(index),[course_id, time_period, is_final]));
            }
            const result = await Promise.all(query_list);
            const distribution = {};
            const ALL_GRADES = Array.from({ length: 11 }, (_, i) => String(i));
            for (const res of result) {
              if (res.length === 0) continue;
            
              const question = res[0].question;
              distribution[question] = {};
            
              for (const g of ALL_GRADES) {
                distribution[question][g] = 0;
              }
          
              res.forEach(({ grade, count }) => {
                distribution[question][grade] = count;
              });
            }
            return distribution;
        } catch (err){
            console.error(err);
            throw err;
        }
    }
}

function createQuestionQuery(questionIndex){
    const i = questionIndex < 10 ? `0${questionIndex}` : questionIndex;
    return `
        SELECT 'Q${i}' AS question, CAST(JSON_UNQUOTE(JSON_EXTRACT(grades_per_question, '$.Q${i}')) AS UNSIGNED) AS grade, COUNT(*) AS count
        FROM grades WHERE course_id = ? AND time_period = ? AND is_final = ?
        GROUP BY CAST(JSON_UNQUOTE(JSON_EXTRACT(grades_per_question, '$.Q${i}')) AS UNSIGNED)
        `;
}