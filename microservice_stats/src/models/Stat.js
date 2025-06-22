import { executeQuery } from '../utils/database.js';

export class Stat {
    constructor(data = {}){
        this.course_id = data.course_id;
        this.time_period = data.time_period;
        this.distribution = data.distribution;
        this.is_final = data.is_final || false
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async create(statsData){
        const { course_id, time_period, distribution, is_final } = statsData;
        const query = `
            INSERT INTO stats (course_id, time_period, distribution, is_final)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                distribution = VALUES(distribution),
                updated_at = CURRENT_TIMESTAMP
        `;
        try {
            await executeQuery(query, [course_id, time_period, distribution, is_final]);
            return new Stat(statsData);
        } catch (err){
            if (err.code === "ER_DUP_ENTRY"){
                throw new Error('Course already exists');
            }
            throw err;
        }
    }

    static async fetchStatsFromDb(course_id, time_period, grade_state){
        const query = `SELECT distribution FROM stats WHERE course_id = ? AND time_period = ? AND is_final = ?`;
        const is_final = (grade_state === "FINAL") ? true : false;
        try {
            const result = await executeQuery(query, [course_id, time_period, is_final]);
            return result;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    static async delete(course_id, time_period) {
        const query = 'DELETE FROM stats WHERE course_id = ? and time_period = ?';
        try {
            const result = await executeQuery(query, [course_id, time_period]);
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