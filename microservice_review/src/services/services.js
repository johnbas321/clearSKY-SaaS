import { UsageError } from '../errors/usageError.js';
import { Request } from '../models/Request.js';
import { Reply } from '../models/Reply.js';

export async function viewRequestStatus(request_id) {
    let reply = {}
    try {
        const request = await Request.findById(request_id);
        if (!request){
            throw new Error('Review request does not exist');
        }
        reply = { request_message: request.request_message, request_state: request.request_state, created_at: request.created_at };
        if (request.request_state === "CLOSED"){
            const reply_message = await Reply.findByRequstId(request_id);
            if (!reply_message){
                throw new UsageError("Internal Server Error. Should have been a reply here. Please retry.", 500);
            }
            reply.reply_message = reply_message.reply_message;
        }
        return reply;
    } catch (err){
        throw err;
    }
}
