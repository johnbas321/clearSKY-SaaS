import { UsageError } from '../errors/usageError.js';
import { Stat } from '../models/Stat.js';
import { fetchStatsFromGrades } from '../services/services.js';

export async function getStats(req, res, next) {
  try{
    const { course_id, time_period, grade_state } = req.query;

    if (!course_id || !time_period || grade_state){
      throw new UsageError('Request is missing important information', 400)
    }
    let result = await Stat.fetchStatsFromDb(course_id, time_period, grade_state);
    if (result.length === 0){
      console.log("Fetching from grade microservice...");
      result = await fetchStatsFromGrades(course_id, time_period, grade_state);
      console.log (result);
      await Stat.create({ course_id, time_period, distribution: result, is_final : (grade_state === "FINAL") ? true : false })
    } else{
      result = result[0].distribution;
    }
    res.status(201).json(result);

  } catch (err){
      next(err);
    }
}