import { UsageError } from '../errors/usageError.js';
import { Stat } from '../models/Stat.js';
import { fetchStatsFromGrades } from '../services/services.js';

export async function getStats(req, res, next) {
  try{
    const { course_id, time_period, grade_state } = req.query;

    if (!course_id || !time_period || !grade_state){
      throw new UsageError('Request is missing important information', 400)
    }
    if (grade_state !== "FINAL" && grade_state !== "OPEN"){
      throw new UsageError('Invalid grade_state');
    }
    const is_final = grade_state === "FINAL" ? true : false;
    let {result, canFetch} = await Stat.fetchStatsFromDb(course_id, time_period, grade_state);
    if (result.length === 0){
      console.log("Fetching from grade microservice...");
      result = await fetchStatsFromGrades(course_id, time_period, grade_state);
      await Stat.create({ course_id, time_period, distribution: result, is_final : is_final })
    } else{
        if (!canFetch){
          result = result[0].distribution;
        } else{
          console.log("Fetching final from grade microservice...");
          result = await fetchStatsFromGrades(course_id, time_period, grade_state);
          await Stat.create({ course_id, time_period, distribution: result, is_final : is_final })
        }
    }
    res.status(201).json(result);

  } catch (err){
      next(err);
    }
}