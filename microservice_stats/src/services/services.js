import { UsageError } from '../errors/usageError.js';


export async function fetchStatsFromGrades(course_id, time_period, grade_state) {
    const queryParams = new URLSearchParams({
        course_id,
        time_period,
        is_final : (grade_state === "FINAL") ? true : false
    }).toString();
    try {
        const response = await fetch(`http://192.168.1.48:3002/grades/internal/grades/stats?${queryParams}`, {
            method: 'GET',
            headers: { 'x-internal-token': process.env.INTERNAL_API_TOKEN || "prod123#"}
        });
        const result = await response.json();
        if (!response.ok){
            console.error(`Grading error: ${response.status} - ${result.message}`);
            throw new UsageError(`Internal communication error: ${result.message}.`, 500);
        }
        return result
    } catch (err){
        throw err;
    }
}