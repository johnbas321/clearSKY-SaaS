import { UsageError } from '../errors/usageError.js';


export async function fetchStatsFromGrades(course_id, time_period, grade_state) {
    const queryParams = new URLSearchParams({
        course_id,
        time_period,
        is_final : (grade_state === "FINAL") ? true : false
    }).toString();
    try {
        console.log(queryParams)
        const response = await fetch(`http://grading:3002/grades/internal/grades/stats?${queryParams}`, {
            method: 'GET',
            headers: { 'x-internal-token': process.env.INTERNAL_API_TOKEN || "prod123#"}
        });
        const result = await response.json();
        if (!response.ok){
            console.error(`Grading error: ${response.status} - ${result.message}`);
            throw new UsageError(`Internal communication error: ${result.message}.`, 500);
        }
        if (Object.keys(result).length === 0){
            throw new UsageError('Can not find the specific grades requested.', 404);
        }
        return result
    } catch (err){
        throw err;
    }
}