import { executeQuery } from '../utils/database.js';

export class Reply {
    constructor(data = {}){
        this.request_id = data.request_id;
        this.student_name = data.student_name;
        this.reply_message = data.reply_message;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(replyData){
        const { request_id, student_name, reply_message } = replyData;
        const query = `
            INSERT INTO replies (request_id, student_name, reply_message)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                reply_message = VALUES(reply_message)
        `;
        try {
            await executeQuery(query, [request_id, student_name, reply_message]);
            return new Reply(replyData);
        } catch (err){
            if (err.code === "ER_DUP_ENTRY"){
                throw new Error('Reply already exists');
            }
            throw err;
        }
    }
    static async findByRequstId(request_id) {
        const query = 'SELECT reply_message FROM replies WHERE request_id = ?';
        try {
            const result = await executeQuery(query, [request_id]);
            if (result.length === 0) {
                return null;
            }
            return result;
        } catch (err){
            console.error(err);
            throw err;
        }
    }
}