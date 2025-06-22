import { executeQuery } from '../utils/database.js';

export class Request {
    constructor(data = {}){
        this.request_id = data.request_id;
        this.course_name = data.course_name;
        this.time_period = data.time_period;
        this.student_id = data.student_id;
        this.student_name = data.student_name;
        this.instructor_id = data.instructor_id;
        this.request_message = data.request_message;
        this.request_state = data.request_state || "OPEN";
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(requestData){
        const { course_name, time_period, student_id, student_name, instructor_id, request_message } = requestData;
        const query = `
            INSERT INTO requests (course_name, time_period, student_id, student_name, instructor_id, request_message)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        try {
            const result = await executeQuery(query, [course_name, time_period, student_id,  student_name, instructor_id, request_message]);
            return result.insertId;
        } catch (err){
            if (err.code === "ER_DUP_ENTRY"){
                throw new Error('Request already exists');
            }
            throw err;
        }
    }
    static async findById(request_id) {
        const query = 'SELECT * FROM requests WHERE request_id = ?';
        try {
            const result = await executeQuery(query, [request_id]);
            if (result.length === 0) {
                return null;
            }
            return new Request(result[0]);
        } catch (err){
            console.error(err);
            throw err;
        }
    }

    static async getRequestMessageById(request_id){
        try {
            const request = await Request.findById(request_id);
            if (!request){
                throw new Error("Request does not exist");
            }
            return request.request_message;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
    
    static async findByCourseAndStudent(course_name, time_period, student_id) {
        const query = 'SELECT * FROM requests WHERE course_name = ? AND time_period = ? and student_id = ?';
        try {
            const result = await executeQuery(query, [course_name, time_period, student_id]);
            if (result.length === 0) {
                return null;
            }
            return new Request(result[0]);
        } catch (err){
            console.error(err);
            throw err;
        }
    }
    static async getRequestActions(request_id, grade_state){
        try {
            const request = await Request.findById(request_id);
            if (!request && grade_state === 'FINAL'){
                return { can_request: false, can_view: false}
            }
            if (!request && grade_state === 'OPEN'){
                return { can_request: true, can_view: false}
            }
            return { can_request: false, can_view: true}
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    // static async canViewRequestStatus(course_name, time_period, student_id){
    //     try {
    //         const request = await Request.findByCourseAndStudent(course_name, time_period, student_id);
    //         if (!request){
    //             return false;
    //         }
    //         return true;
    //     } catch (err) {
    //         console.log(err);
    //         throw err;
    //     }
    // }   


    static async getRequestsPerInstructor(instructor_id){
        const query = `SELECT request_id, course_name, time_period, student_name FROM requests WHERE instructor_id = ? AND request_state = 'OPEN' `;
        try {
            const result = await executeQuery(query, [instructor_id]);
            console.log(result);
            return result;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    static async closeRequest(request_id){
        try {
            console.log('gasdfgs')

            const request = await Request.findById(request_id);
            if (!request){
                throw new Error('Review request does not exist');
            }
            if (request.request_state === "CLOSED"){
                throw new Error('This request is already closed');
            }
            console.log('gasdfgs')
            const query = `UPDATE requests SET request_state ='CLOSED' WHERE request_id = ?`
            const result = await executeQuery(query, [request_id]);
            return result.affectedRows;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

}