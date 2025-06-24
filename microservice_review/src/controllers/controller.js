import { UsageError } from '../errors/usageError.js';
import { Request } from '../models/Request.js';
import { Reply } from '../models/Reply.js';
import { viewRequestStatus } from '../services/services.js';

export async function createReview(req, res, next) {
  try{
    const student_id = req.user.userId;
    const student_name = req.user.userName;

    if (req.user.role !== 'student') {
      throw new UsageError('Only students can create a review request', 403);
    }

    if (!req.body.course_name || !req.body.time_period || !req.body.grade_state || !req.body.request_message || !req.body.instructor_id){
      throw new UsageError('Empty values provided', 400)
    }
    const { course_name, time_period, grade_state, request_message, instructor_id } = req.body;

    const request_id = await Request.create({
      course_name,
      time_period,
      student_id,
      student_name,
      instructor_id,
      request_message
    });
    res.status(201).json({ message: 'Review Request created successfully', request_id: request_id });
  } catch(err){
    next(err);
  }
}

export async function viewStatus(req, res, next){
  try{
    const student_id = req.user.userId;
    if (req.user.role !== 'student') {
      throw new UsageError('Only students can view their review status', 403);
    }

    const { course_name, time_period } = req.query;
    if (!course_name || !time_period ){
      throw new UsageError('Request is missing important information', 400)
    }

    const reply = await viewRequestStatus(course_name, time_period, student_id);
    res.status(200).json(reply);

  } catch(err){
    next(err);
  }
}

export async function viewInstructorRequests(req, res, next) {
  try{

    const instructor_id = req.user.userId;
    if (req.user.role !== 'instructor') {
      throw new UsageError('Only instructors can view their pending requests', 403);
    }
    const reply = await Request.getRequestsPerInstructor(instructor_id);
    if (reply.length === 0){
    }
    res.status(200).json(reply);
  } catch(err){
    next(err);
  }
}

export async function getRequestMessage(req, res, next){
  try{
    if (!req.params){
      throw new UsageError('No information provided', 400)
    }
    const request_id = req.params.request_id;
    const reply = await Request.getRequestMessageById(request_id);
    res.status(200).json(reply);
  } catch (err){
    next(err);
  }
}

export async function createReply(req, res, next) {
  try{
    const instructor_id = req.user.userId;
    if (req.user.role !== 'instructor') {
      throw new UsageError('Only instructors can reply to review requests', 403);
    }

    
    if (!req.body.request_id || !req.body.student_name || !req.body.reply_message){
      throw new UsageError('Empty values provided', 400)
    }
    const { request_id, student_name, reply_message } = req.body;

    await Reply.create({
      request_id,
      student_name,
      reply_message
    });
    console.log('[DEBUG] request_id:', request_id, typeof request_id);
    await Request.closeRequest(request_id);

    res.status(201).json({ message: 'Review Reply created successfully' });
  } catch(err){
    next(err);
  }
}

export async function getReviewActions(req, res, next){
  try {
    const grade_state = req.query.grade_state;
    if (req.user.role !== 'student') {
      throw new UsageError('Only students can create/view a review', 403);
    }
    if (!req.params || !grade_state){
      throw new UsageError('No information provided', 400)
    }
    const request_id = req.params.request_id;
    const reply = await Request.getRequestActions(request_id, grade_state);
    res.status(200).json(reply);
  } catch (err){
    next(err);
  }
}

export async function healthCheck(req, res, next){
  try{
    res.json({message: 'healthy'});
  } catch (err){
    next(err);
  }
}