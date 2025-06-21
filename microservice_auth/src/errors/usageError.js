export class UsageError extends Error {
    constructor(msg, statusCode = 400, error = 'error') {
        super(msg);
        this.statusCode = statusCode;
        this.error = error;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}