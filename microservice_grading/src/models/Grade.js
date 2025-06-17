import { executeQuery } from '../utils/database.js';

export class Grade {
    constructor(data ={}){
        this.course_id = data.course_id;
        this.time_period = data.time_period;
        this.student_id = data.student_id;
        this.grade = data.grade;
        this.grades_per_question = data.grades_per_question;
        this.is_final = data.is_final || false;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(gradeData){
        const { course_id, time_period, student_id, grade, grades_per_question, is_final } = gradeData;
        const query = `
            INSERT INTO grades (course_id, time_period, student_id, grade, grades_per_question, is_final)
            VALUES(?, ?, ?, ?, ?, ?)
        `;
        try {
            if (is_final){
                const deletedInitalGrade = await this.delete(course_id, time_period, student_id);
                if (!deletedInitalGrade) {
                    throw new Error('Trying to upload final grades without inital grades uploaded');
                }
            }
            await executeQuery(query, [course_id, time_period, student_id, grade, grades_per_question, is_final]);
            return new Grade(gradeData);
        } catch(err){
            if (err.code === "ER_DUP_ENTRY"){
                throw new Error('Grade already exists');
            }
            throw err;
        }
    }

    static async findById(course_id, time_period, student_id) {
        const query = 'SELECT * FROM grades WHERE course_id = ? and time_period = ? and student_id = ?';
        try {
            const result = await executeQuery(query, [course_id, time_period, student_id]);
            if (result.length === 0) {
                return null;
            }
            return new Grade(result[0]);
        } catch (err){
            console.error(err);
            throw err;
        }
    }

    static async updateGrade(course_id, time_period, student_id) {
        query = `UPDATE courses SET grade_state = OPEN WHERE course_name = ?`;

        const query = 'UPDATE grades SET grade ='
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
}
