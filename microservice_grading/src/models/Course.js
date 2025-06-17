import { executeQuery } from '../utils/database.js';

export class Course {
    constructor(data ={}){
        this.id = data.id;
        this.course_name = data.course_name;
        this.instructor_id = data.instructor_id;
        this.time_period = data.time_period;
        this.grade_state = data.grade_state || 'OPEN';
        this.initial_grades_at = data.initial_grades_at;
        this.final_grades_at = data.final_grades_at;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(courseData){
        const { id, course_name, instructor_id, time_period } = courseData;
        const query = `
            INSERT INTO courses (id, course_name, instructor_id, time_period)
            VALUES(?, ?, ?, ?)
        `;
        try {
            const result = await executeQuery(query, [id, course_name, instructor_id, time_period]);
            return new Course(courseData)
        } catch(err){
            if (err.code === "ER_DUP_ENTRY"){
                throw new Error('Course already exists');
            }
            throw err;
        }
    }

    static async findByName(courseName, time_period) {
        const query = 'SELECT * FROM courses WHERE course_name = ? AND time_period = ?';
        try {
            const result = await executeQuery(query, [courseName, time_period]);
            if (result.length === 0) {
                return null;
            }
            return new Course(result[0]);
        } catch (err){
            console.error(err);
            throw err;
        }
    }

    static async updateState(courseName, time_period){
        const course = await Course.findByName(courseName, time_period);
        if (!course){
            throw new Error('Course does not exist');
        }
        const currentState = course.grade_state;
        const query = '';
        switch (currentState) {
            case 'VOID':
                query = `UPDATE courses SET grade_state = OPEN WHERE course_name = ? AND time_period = ?`;
                break;
            case 'OPEN':
                query = `UPDATE courses SET grade_state = FINAL WHERE course_name = ? AND time_period = ?`;
                break;
            case 'FINAL':
                throw new Error('Can not a FINAL course grade');
            default:
                throw new Error('Internal Error');
        }
        try{
            const result = await executeQuery(query, [courseName, time_period]);
            return result.affectedRows;
        } catch (err){
            console.log(err);
            throw err;
        }

    }
    static async canUploadInitialGrades(courseName, time_period){
        const course = await Course.findByName(courseName, time_period);
        if (!course){
            throw new Error('Course does not exist');
        }
        const currentState = course.grade_state;
        if (currentState !== "VOID") {
            return false;
        }
        return true;
    }
    
    static async canUploadFinalGrades(courseName, time_period){
        const course = await Course.findByName(courseName, time_period);
        if (!course){
            throw new Error('Course does not exist');
        }
        const currentState = course.grade_state;
        if (currentState !== "OPEN") {
            return false;
        }
        return true;
    }

    static async delete(courseName, time_period) {
        const query = 'DELETE FROM courses WHERE course_name = ? AND time_period = ? AND grade_state = VOID';
        try {
            const result = await executeQuery(query, [courseName, time_period]);
            if (result.affectedRows === 0) {
                return null;
            }
            return result.affectedRows;
        } catch (err){
            console.error(err);
            throw err;
        }
    }
}
